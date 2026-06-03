import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find()
      .populate("organization")
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

    const body = await req.json();

    const event = await Event.create(body);

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
