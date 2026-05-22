import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";
import Event from "@/models/event";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    const organization = await Organization.findById(params.id);
    const events = await Event.find({
      organization: params.id,
    });

    return NextResponse.json({
      success: true,
      organization,
      events,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organization",
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
    const updatedOrganization = await Organization.findByIdAndUpdate(
      params.id,
      body,
      { new: true },
    );
    return NextResponse.json({
      success: true,
      updatedOrganization,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update organization",
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
    await Organization.findByIdAndDelete(params.id);
    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete organization",
      },
      { status: 500 },
    );
  }
}
