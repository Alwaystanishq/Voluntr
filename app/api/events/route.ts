import { readEventCache, writeEventCache, invalidateEventCache } from "@/lib/event-cache";
import { literalPattern, parseEventFilters } from "@/lib/event-filters";
import Organization from "@/models/organiztion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseEvent } from "@/lib/event-validation";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function GET(req: Request) {
  let filters;
  try { filters = parseEventFilters(new URL(req.url).searchParams); }
  catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Invalid filters" }, { status: 400 }); }
  try {
    const cached = await readEventCache(new URL(req.url).searchParams);
    if (cached.value) return NextResponse.json(cached.value, { headers: { "X-Event-Cache": "HIT", "Cache-Control": "no-store" } });
    await connectDB();

    const { q, page, sort, conditions, pageSize } = filters;
    if (q) {
      const pattern = { $regex: literalPattern(q), $options: "i" };
      const organizations = await Organization.find({ name: pattern }).select("_id").lean();
      conditions.push({ $or: [{ title: pattern }, { organization: { $in: organizations.map((organization) => organization._id) } }] });
    }
    const query = conditions.length ? { $and: conditions } : {};
    const [events, total] = await Promise.all([
      Event.find(query)
        .select("-waitlistedUsers -enrolledUsers")
        .populate("organization", "name description verificationStatus")
        .sort(sort === "newest" ? { createdAt: -1, _id: -1 } : { date: 1, _id: 1 })
        .skip((page - 1) * pageSize).limit(pageSize),
      Event.countDocuments(query),
    ]);

    const payload = {
      success: true,
      events,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
    await writeEventCache(cached.key, payload);
    return NextResponse.json(payload, { headers: { "X-Event-Cache": cached.key ? "MISS" : "BYPASS", "Cache-Control": "no-store" } });
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
    await invalidateEventCache();

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
