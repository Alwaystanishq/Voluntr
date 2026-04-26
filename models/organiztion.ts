import { Schema, models, model } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ngo", "individual"],
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default models.Organization || model("Organization", OrganizationSchema);