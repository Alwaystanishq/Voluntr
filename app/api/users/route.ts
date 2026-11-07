import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Organization from "@/models/organiztion";
import { parseUserName } from "@/lib/user-profile";

// Account enumeration is intentionally unavailable. Signup remains public.
export async function POST(req: Request) {
  let data;
  try {
    const body = await req.json();
    const { name } = parseUserName({ name: body?.name });
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || body.email.trim().length > 254) throw new Error("Enter a valid email address.");
    if (typeof body.password !== "string" || body.password.length < 8 || new TextEncoder().encode(body.password).length > 72) throw new Error("Password must be at least 8 characters and no more than 72 bytes.");
    data = { name, email: body.email.trim().toLowerCase(), password: body.password };
  } catch (error) {
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Invalid signup data" }, { status: 400 });
  }
  try {
    await connectDB();
    const existing = await Organization.exists({ email: data.email });
    if (existing) return Response.json({ success: false, message: "This email is already registered." }, { status: 409 });
    const created = await User.create(data);
    return Response.json({ success: true, user: { _id: created._id, name: created.name, email: created.email } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) return Response.json({ success: false, message: "This email is already registered." }, { status: 409 });
    console.error("User signup failed");
    return Response.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}
