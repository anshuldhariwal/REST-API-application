import { Schema, Types, model } from "mongoose";

export enum SessionStatus {
  Available = "AVAILABLE",
  Booked = "BOOKED",
  Completed = "COMPLETED"
}

export interface SessionDocument {
  teacherId: Types.ObjectId;
  userId: Types.ObjectId | null;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  completedAt: Date | null;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.Available
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ userId: 1, status: 1, startTime: 1 });

export const Session = model<SessionDocument>("Session", sessionSchema);
