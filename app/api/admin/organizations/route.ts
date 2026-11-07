import { adminSession } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { PUBLIC_ORGANIZATION_FIELDS, PRIVATE_ORGANIZATION_FIELDS } from "@/lib/organization-profile";
import Organization from "@/models/organiztion";

export async function GET() {
  if (!await adminSession()) return Response.json({ message: "Admin access required" }, { status: 403 });
  try {
    await connectDB();
    const organizations = await Organization.find({ verificationStatus: "pending" }).select(`${PUBLIC_ORGANIZATION_FIELDS} ${PRIVATE_ORGANIZATION_FIELDS} updatedAt`).sort({ verificationRequestedAt: 1 });
    return Response.json({ organizations }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Could not load verification requests" }, { status: 500 });
  }
}
