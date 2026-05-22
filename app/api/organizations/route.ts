import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Organization from "@/models/organiztion";

export async function GET() {
  try {
    await connectDB();
    const organizations = await Organization.find();
    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizations",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const organization = await Organization.create(body);
    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create organization",
      },
      { status: 500 },
    );
  }
}
