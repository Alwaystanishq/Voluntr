import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { parseUserName, USER_PROFILE_FIELDS } from "@/lib/user-profile";
import User from "@/models/user";
import Event from "@/models/event";

type Context = { params: Promise<{ id: string }> };

async function handle(req: Request, context: Context, action: "read" | "update" | "delete") {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!isValidObjectId(id)) return Response.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    if (session.user.role !== "user" || session.user.id !== id) return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    let updates;
    if (action === "update") {
      try { updates = parseUserName(await req.json()); }
      catch (error) { return Response.json({ success: false, message: error instanceof Error ? error.message : "Invalid profile" }, { status: 400 }); }
    }
    await connectDB();
    const user = await User.findById(id).select(USER_PROFILE_FIELDS);
    if (!user) return Response.json({ success: false, message: "User not found" }, { status: 404 });
    const headers = { "Cache-Control": "private, no-store" };
    if (action === "read") {
      const enrolledEvents = await Event.find({ enrolledUsers: id }).select("title description date endDate location category requiredSkills capacity registrationDeadline coverImage organization");
      return Response.json({ success: true, user, enrolledEvents }, { headers });
    }
    if (action === "update") {
      const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select(USER_PROFILE_FIELDS);
      if (!updatedUser) return Response.json({ success: false, message: "User not found" }, { status: 404 });
      return Response.json({ success: true, updatedUser }, { headers });
    }
    await User.findByIdAndDelete(id);
    return Response.json({ success: true, message: "User deleted successfully" }, { headers });
  } catch {
    console.error("User account request failed");
    return Response.json({ success: false, message: "Could not process account request" }, { status: 500 });
  }
}

export async function GET(req: Request, context: Context) { return handle(req, context, "read"); }
export async function PUT(req: Request, context: Context) { return handle(req, context, "update"); }
export async function DELETE(req: Request, context: Context) { return handle(req, context, "delete"); }
