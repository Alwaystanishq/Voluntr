import { invalidateEventCache } from "@/lib/event-cache";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseOrganizationProfile, PUBLIC_ORGANIZATION_FIELDS, PRIVATE_ORGANIZATION_FIELDS } from "@/lib/organization-profile";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";
import Event from "@/models/event";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
    const session = await getServerSession(authOptions);
    const owner = session?.user.role === "ngo" && session.user.id === id;
    const organization = await Organization.findById(id).select(PUBLIC_ORGANIZATION_FIELDS + (owner ? ` ${PRIVATE_ORGANIZATION_FIELDS}` : ""));

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization not found",
        },
        {
          status: 404,
        },
      );
    }

    const events = await Event.find({
      organization: id,
    }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      organization: {
        ...organization.toObject(),
        events: events.map((event: { toObject(): Record<string, unknown> }) => {
          const details = event.toObject();
          const waitlistCount = Array.isArray(details.waitlistedUsers) ? details.waitlistedUsers.length : 0;
          delete details.waitlistedUsers;
          if (!owner) delete details.enrolledUsers;
          return { ...details, waitlistCount };
        }),
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organization",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ngo" || session.user.id !== id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
    let data;
    try { data = parseOrganizationProfile(await req.json()); }
    catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid profile" }, { status: 400 }); }
    const existing = await Organization.findById(id);
    if (!existing) return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    const identityChanged = ["name", "website", "registrationNumber", "verificationDocument"].some((field) => data[field] !== undefined && data[field] !== (existing[field] || ""));
    const updatedOrganization = await Organization.findOneAndUpdate({ _id: id, updatedAt: existing.updatedAt }, {
      $set: { ...data, ...(identityChanged ? { verificationStatus: "unverified", verificationNote: "", verifiedAt: null, verificationRequestedAt: null } : {}) },
    }, { new: true, runValidators: true }).select(`${PUBLIC_ORGANIZATION_FIELDS} ${PRIVATE_ORGANIZATION_FIELDS}`);
    if (!updatedOrganization) return NextResponse.json({ message: "Profile changed. Reload and try again." }, { status: 409 });
    await invalidateEventCache();

    return NextResponse.json({
      success: true,
      updatedOrganization,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update organization",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ngo" || session.user.id !== id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
    await Organization.findByIdAndDelete(id);
    await invalidateEventCache();

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete organization",
      },
      {
        status: 500,
      },
    );
  }
}
