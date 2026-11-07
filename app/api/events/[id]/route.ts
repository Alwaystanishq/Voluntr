import { parseEvent } from "@/lib/event-validation";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const event = await Event.findById(id)
      .select("-waitlistedUsers")
      .populate("organization", "name description verificationStatus")
      .populate("enrolledUsers", "_id");

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event",
      },
      { status: 500 },
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

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 },
      );
    }

    if (session.user.role !== "ngo" || event.organization.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    let data;
    try {
      data = parseEvent(await req.json(), event.toObject());
      if (data.capacity != null && Number(data.capacity) < event.enrolledUsers.length) throw new Error("Capacity cannot be below current enrollment.");
    } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Invalid event data" }, { status: 400 }); }
    const now = new Date();
    const start = new Date(String(data.date || event.date));
    const deadline = data.registrationDeadline !== undefined ? data.registrationDeadline : event.registrationDeadline;
    const capacity = data.capacity !== undefined ? data.capacity : event.capacity;
    const enrolled = [...event.enrolledUsers];
    let waiting = [...(event.waitlistedUsers || [])];
    if (start > now && (!deadline || new Date(String(deadline)) > now)) {
      const free = capacity == null ? waiting.length : Math.max(0, Number(capacity) - enrolled.length);
      enrolled.push(...waiting.slice(0, free));
      waiting = waiting.slice(free);
    }
    const updatedEvent = await Event.findOneAndUpdate({
      _id: id,
      updatedAt: event.updatedAt,
      $expr: { $and: [
        { $eq: [{ $ifNull: ["$enrolledUsers", []] }, event.enrolledUsers || []] },
        { $eq: [{ $ifNull: ["$waitlistedUsers", []] }, event.waitlistedUsers || []] },
      ] },
    }, { $set: { ...data, enrolledUsers: enrolled, waitlistedUsers: waiting } }, {
      new: true, runValidators: true,
    });
    if (!updatedEvent) return NextResponse.json({ success: false, message: "Enrollment or event details changed. Please reload and try again." }, { status: 409 });

    return NextResponse.json(
      {
        success: true,
        updatedEvent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event",
      },
      { status: 500 },
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

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 },
      );
    }

    if (session.user.role !== "ngo" || event.organization.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete event",
      },
      { status: 500 },
    );
  }
}
