import bcrypt from "bcryptjs";
import { Schema, model, models } from "mongoose";

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

    mission: { type: String, default: "" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    location: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    verificationDocument: { type: String, default: "" },
    verificationStatus: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" },
    verificationRequestedAt: Date,
    verifiedAt: Date,
    verificationNote: { type: String, default: "" },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

OrganizationSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

const Organization =
  models.Organization || model("Organization", OrganizationSchema);

export default Organization;
