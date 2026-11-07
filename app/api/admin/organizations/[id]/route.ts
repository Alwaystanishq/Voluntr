import { invalidateEventCache } from "@/lib/event-cache";
import { isValidObjectId } from "mongoose";
import { adminSession } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminSession()) return Response.json({ message: "Admin access required" }, { status: 403 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ message: "Invalid organization ID" }, { status: 400 });
  let body;
  try {
    body = await req.json();
    if (!body || !["verified", "rejected"].includes(body.status) || typeof body.note !== "string" || body.note.length > 2000 || typeof body.version !== "string" || !Number.isFinite(Date.parse(body.version))) throw new Error();
    if (body.status === "rejected" && !body.note.trim()) throw new Error();
  } catch { return Response.json({ message: "Choose approve or reject; rejection requires a reason." }, { status: 400 }); }
  try {
    await connectDB();
    const organization = await Organization.findOneAndUpdate({ _id: id, verificationStatus: "pending", updatedAt: new Date(body.version) }, {
      $set: { verificationStatus: body.status, verificationNote: body.note.trim(), verifiedAt: body.status === "verified" ? new Date() : null },
    }, { new: true });
    if (!organization) return Response.json({ message: "This request changed or was already reviewed. Refresh the queue." }, { status: 409 });
    await invalidateEventCache();
    return Response.json({ message: body.status === "verified" ? "Organization verified." : "Request rejected." });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Could not review request" }, { status: 500 });
  }
}
