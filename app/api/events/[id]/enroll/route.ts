import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    const { userId } = await req.json();
    const event = await Event.findByIdAndUpdate(
      params.id,
      {
        $addToSet: {
          enrolledUsers: userId,
        },
      },
      { new: true },
    );
    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enroll user",
      },
      { status: 500 },
    );
  }
}
