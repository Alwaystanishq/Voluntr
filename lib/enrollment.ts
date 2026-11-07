import { Types } from "mongoose";
import Event from "@/models/event";

type EnrollmentEvent = {
  enrolledUsers?: Types.ObjectId[];
  waitlistedUsers?: Types.ObjectId[];
  capacity?: number | null;
  date: Date;
  registrationDeadline?: Date | null;
};

export class EnrollmentError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export function enrollmentStatus(event: EnrollmentEvent, userId: string, now = new Date()) {
  const enrolled = event.enrolledUsers || [];
  const waiting = event.waitlistedUsers || [];
  const position = waiting.findIndex((id) => id.toString() === userId);
  const status = enrolled.some((id) => id.toString() === userId) ? "enrolled" : position >= 0 ? "waitlisted" : "none";
  const started = event.date <= now;
  return {
    status, position: status === "waitlisted" ? position + 1 : null,
    enrolledCount: enrolled.length, waitlistCount: waiting.length,
    capacity: event.capacity ?? null,
    registrationClosed: started || !!(event.registrationDeadline && event.registrationDeadline <= now),
    started,
  };
}

// Compare the complete enrollment snapshot before writing. Concurrent enrollments,
// cancellations and capacity edits retry instead of overwriting each other.
export async function updateEnrollment(eventId: string, userId: string, action: "join" | "leave") {
  for (let attempt = 0; attempt < 8; attempt++) {
    const event = await Event.findById(eventId);
    if (!event) throw new EnrollmentError("Event not found", 404);
    const now = new Date();
    const current = enrollmentStatus(event, userId, now);
    if (action === "join" && current.status !== "none") return { ...current, message: current.status === "enrolled" ? "You are already enrolled." : "You are already on the waitlist." };
    if (action === "leave" && current.status === "none") return { ...current, message: "You are no longer registered for this event." };
    if (action === "join" && current.registrationClosed) throw new EnrollmentError("Registration has closed.", 409);
    if (action === "leave" && current.started && current.status === "enrolled") throw new EnrollmentError("Enrollment cannot be cancelled after the event starts.", 409);

    const previousEnrolled: Types.ObjectId[] = event.enrolledUsers || [];
    const previousWaiting: Types.ObjectId[] = event.waitlistedUsers || [];
    const enrolled = previousEnrolled.filter((id) => action !== "leave" || id.toString() !== userId);
    let waiting = previousWaiting.filter((id) => action !== "leave" || id.toString() !== userId);
    if (action === "join") waiting.push(new Types.ObjectId(userId));
    if (!current.registrationClosed) {
      const free = event.capacity == null ? waiting.length : Math.max(0, event.capacity - enrolled.length);
      enrolled.push(...waiting.slice(0, free));
      waiting = waiting.slice(free);
    }
    const updated = await Event.findOneAndUpdate({
      _id: eventId,
      capacity: event.capacity ?? null,
      date: event.date,
      registrationDeadline: event.registrationDeadline ?? null,
      $expr: { $and: [
        { $eq: [{ $ifNull: ["$enrolledUsers", []] }, previousEnrolled] },
        { $eq: [{ $ifNull: ["$waitlistedUsers", []] }, previousWaiting] },
      ] },
    }, { $set: { enrolledUsers: enrolled, waitlistedUsers: waiting } }, { new: true });
    if (updated) {
      const state = enrollmentStatus(updated, userId, now);
      return { ...state, message: action === "leave" ? "Registration cancelled." : state.status === "enrolled" ? "You are enrolled!" : `Added to the waitlist at position ${state.position}.` };
    }
  }
  throw new EnrollmentError("Registration changed while processing. Please try again.", 409);
}
