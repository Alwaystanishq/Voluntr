import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { connectDB } from "@/lib/mongodb";

import Event from "@/models/event";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id)
      .populate("organization")
      .populate("enrolledUsers");

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        event,
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
        message: "Failed to fetch event",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        {
          status: 404,
        },
      );
    }

    if (event.organization.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    const body = await req.json();

    const updatedEvent = await Event.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    return NextResponse.json(
      {
        success: true,
        updatedEvent,
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
        message: "Failed to update event",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        {
          status: 404,
        },
      );
    }

    if (event.organization.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    await Event.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
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
        message: "Failed to delete event",
      },
      {
        status: 500,
      },
    );
  }
}
