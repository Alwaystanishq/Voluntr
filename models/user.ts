import bcrypt from "bcryptjs";
import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
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
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

export default models.User || model("User", UserSchema);
