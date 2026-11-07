import { invalidateEventCache } from "@/lib/event-cache";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (session.user.role !== "ngo" || session.user.id !== id) return Response.json({ message: "Forbidden" }, { status: 403 });
  if (!isValidObjectId(id)) return Response.json({ message: "Invalid organization ID" }, { status: 400 });
  try {
    await connectDB();
    const organization = await Organization.findById(id);
    if (!organization) return Response.json({ message: "Organization not found" }, { status: 404 });
    if (["pending", "verified"].includes(organization.verificationStatus)) return Response.json({ message: "This profile is already verified or awaiting review." }, { status: 409 });
    if (!organization.website || !organization.mission || !organization.registrationNumber || !organization.verificationDocument) return Response.json({ message: "Add your mission, website, registration number and a supporting document URL, then save before requesting review." }, { status: 400 });
    const result = await Organization.updateOne({ _id: id, updatedAt: organization.updatedAt }, { $set: { verificationStatus: "pending", verificationRequestedAt: new Date(), verificationNote: "", verifiedAt: null } });
    if (!result.modifiedCount) return Response.json({ message: "Profile changed. Reload and try again." }, { status: 409 });
    await invalidateEventCache();
    return Response.json({ message: "Verification requested. Your profile is awaiting admin review." });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Could not request verification" }, { status: 500 });
  }
}
