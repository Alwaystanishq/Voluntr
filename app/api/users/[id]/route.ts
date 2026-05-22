import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Event from "@/models/event";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    const user = await User.findById(params.id);
    const enrolledEvents = await Event.find({
      enrolledUsers: params.id,
    });
    return NextResponse.json({
      success: true,
      user,
      enrolledEvents,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    return NextResponse.json({
      success: true,
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}
