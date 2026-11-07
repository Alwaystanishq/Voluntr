import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import { isValidObjectId } from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "user") return Response.json({ success: false, message: "Only volunteers can enroll" }, { status: 403 });
    const { id } = await params;
    if (!isValidObjectId(id)) return Response.json({ success: false, message: "Invalid event ID" }, { status: 400 });
    await connectDB();
    const now = new Date();
    // Check availability and add the volunteer in one operation so simultaneous requests cannot overbook.
    const event = await Event.findOneAndUpdate({
      _id: id,
      enrolledUsers: { $ne: session.user.id },
      date: { $gt: now },
      $and: [
        { $or: [{ registrationDeadline: null }, { registrationDeadline: { $gt: now } }] },
        { $expr: { $or: [
          { $eq: [{ $ifNull: ["$capacity", null] }, null] },
          { $lt: [{ $size: { $ifNull: ["$enrolledUsers", []] } }, "$capacity"] },
        ] } },
      ],
    }, { $addToSet: { enrolledUsers: session.user.id } }, { new: true });

    if (!event) {
      const existing = await Event.findById(id);
      if (!existing) return Response.json({ success: false, message: "Event not found" }, { status: 404 });
      const enrolled = existing.enrolledUsers.some((userId: { toString(): string }) => userId.toString() === session.user.id);
      const closed = existing.date <= now || (existing.registrationDeadline && existing.registrationDeadline <= now);
      return Response.json({ success: false, message: enrolled ? "User already enrolled" : closed ? "Registration has closed" : "This event is full" }, { status: 409 });
    }
    return Response.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Enrollment failed" }, { status: 500 });
  }
}
