import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import User from "@/models/user";

type Context = { params: Promise<{ id: string }> };

async function handle(context: Context, action: "read" | "save" | "remove") {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "user") return Response.json({ message: "Only volunteers can save events" }, { status: 403 });
  const { id } = await context.params;
  if (!isValidObjectId(id)) return Response.json({ message: "Invalid event ID" }, { status: 400 });
  try {
    await connectDB();
    if (action === "save" && !await Event.exists({ _id: id })) return Response.json({ message: "Event not found" }, { status: 404 });
    const user = action === "read"
      ? await User.findById(session.user.id).select("savedEvents")
      : await User.findByIdAndUpdate(session.user.id,
        action === "save" ? { $addToSet: { savedEvents: id } } : { $pull: { savedEvents: id } },
        { new: true }).select("savedEvents");
    if (!user) return Response.json({ message: "Account not found" }, { status: 404 });
    return Response.json({ saved: (user.savedEvents || []).some((value: { toString(): string }) => value.toString() === id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Could not update saved events" }, { status: 500 });
  }
}

export async function GET(_req: Request, context: Context) { return handle(context, "read"); }
export async function PUT(_req: Request, context: Context) { return handle(context, "save"); }
export async function DELETE(_req: Request, context: Context) { return handle(context, "remove"); }
