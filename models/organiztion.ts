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

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

OrganizationSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

const Organization =
  models.Organization || model("Organization", OrganizationSchema);

export default Organization;
