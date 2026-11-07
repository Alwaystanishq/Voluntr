import { Schema, models, model } from "mongoose";
import { EVENT_CATEGORIES } from "@/types/event";

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: { type: Date },
    location: { type: String, trim: true, default: "" },
    category: { type: String, enum: [...EVENT_CATEGORIES, ""], default: "" },
    requiredSkills: { type: [String], default: [] },
    capacity: { type: Number, min: 1, default: null },
    registrationDeadline: { type: Date },
    coverImage: { type: String, default: "" },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    waitlistedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    enrolledUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default models.Event || model("Event", EventSchema);