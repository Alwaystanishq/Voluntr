import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { groupVolunteerEvents } from "@/lib/volunteer-events";
import Event from "@/models/event";
import User from "@/models/user";
import "@/models/organiztion";
import type { EventDetails } from "@/types/event";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "user") return Response.json({ message: "Only volunteers can access this dashboard" }, { status: 403 });
  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("savedEvents");
    if (!user) return Response.json({ message: "Account not found" }, { status: 404 });
    const fields = "title description date endDate location category requiredSkills capacity registrationDeadline coverImage organization";
    const [enrolled, saved] = await Promise.all([
      Event.find({ enrolledUsers: session.user.id }).select(fields).populate("organization", "name").lean(),
      Event.find({ _id: { $in: user.savedEvents || [] } }).select(fields).populate("organization", "name").sort({ date: 1 }).lean(),
    ]);
    // JSON serialization converts Mongo IDs and Dates into the shared client representation.
    const events = JSON.parse(JSON.stringify(enrolled)) as EventDetails[];
    return Response.json({ ...groupVolunteerEvents(events), saved }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Could not load your dashboard" }, { status: 500 });
  }
}
