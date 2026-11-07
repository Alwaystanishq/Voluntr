import { parseOrganizationProfile, PUBLIC_ORGANIZATION_FIELDS } from "@/lib/organization-profile";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";

export async function GET() {
  try {
    await connectDB();
    const organizations = await Organization.find().select(PUBLIC_ORGANIZATION_FIELDS);
    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizations",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    let profile;
    try {
      profile = parseOrganizationProfile(body);
      if (!profile.name || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.password !== "string" || body.password.length < 8) throw new Error("Name, valid email and a password of at least 8 characters are required.");
    } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid signup" }, { status: 400 }); }
    const created = await Organization.create({ ...profile, email: body.email.trim().toLowerCase(), password: body.password });
    const organization = { _id: created._id, name: created.name };
    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create organization",
      },
      { status: 500 },
    );
  }
}
