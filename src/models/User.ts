import { Schema, model } from "mongoose";

export interface UserDocument {
  fullName: string;
  email: string;
  phone: string;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);
