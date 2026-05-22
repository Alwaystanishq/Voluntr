import bcrypt from "bcryptjs";
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
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

OrganizationSchema.pre("save", async function (this: any, next: any) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

export default models.Organization ||
  model("Organization", OrganizationSchema);