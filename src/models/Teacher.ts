import { Schema, model } from "mongoose";

export interface TeacherDocument {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}

const teacherSchema = new Schema<TeacherDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

export const Teacher = model<TeacherDocument>("Teacher", teacherSchema);
