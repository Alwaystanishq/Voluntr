import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseEvent } from "@/lib/event-validation";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find()
      .populate("organization", "name description")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        events,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ngo") return NextResponse.json({ success: false, message: "Only NGOs can create events" }, { status: 403 });
    let data;
    try { data = parseEvent(await req.json()); }
    catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Invalid event data" }, { status: 400 }); }
    const event = await Event.create({ ...data, organization: session.user.id });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event",
      },
      {
        status: 500,
      },
    );
  }
}
