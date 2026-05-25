import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const body = await req.json();

    const { userId } = body;

    const event = await Event.findById(params.id);

    if (!event) {
      return Response.json(
        {
          success: false,
          message: "Event not found",
        },
        {
          status: 404,
        },
      );
    }

    const alreadyEnrolled = event.enrolledUsers.includes(userId);

    if (alreadyEnrolled) {
      return Response.json(
        {
          success: false,
          message: "User already enrolled",
        },
        {
          status: 400,
        },
      );
    }

    event.enrolledUsers.push(userId);

    await event.save();

    return Response.json(
      {
        success: true,
        message: "Enrolled successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Enrollment failed",
      },
      {
        status: 500,
      },
    );
  }
}
