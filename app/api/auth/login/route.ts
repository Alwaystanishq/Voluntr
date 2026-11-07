import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 400 });
    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 400 },
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch {
    console.error("Login failed");
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 },
    );
  }
}
