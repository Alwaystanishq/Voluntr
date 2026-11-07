import { invalidateEventCache } from "@/lib/event-cache";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { EnrollmentError, enrollmentStatus, updateEnrollment } from "@/lib/enrollment";
import Event from "@/models/event";

type Context = { params: Promise<{ id: string }> };

async function handle(context: Context, action: "read" | "join" | "leave") {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "user") return Response.json({ message: "Only volunteers can manage enrollment" }, { status: 403 });
    const { id } = await context.params;
    if (!isValidObjectId(id)) return Response.json({ message: "Invalid event ID" }, { status: 400 });
    await connectDB();
    if (action === "read") {
      const event = await Event.findById(id);
      if (!event) return Response.json({ message: "Event not found" }, { status: 404 });
      return Response.json(enrollmentStatus(event, session.user.id), { headers: { "Cache-Control": "private, no-store" } });
    }
    const result = await updateEnrollment(id, session.user.id, action);
    await invalidateEventCache();
    return Response.json({ success: true, ...result }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof EnrollmentError) return Response.json({ message: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ message: "Could not update enrollment. Please try again." }, { status: 500 });
  }
}

export async function GET(_req: Request, context: Context) { return handle(context, "read"); }
export async function POST(_req: Request, context: Context) { return handle(context, "join"); }
export async function DELETE(_req: Request, context: Context) { return handle(context, "leave"); }
