import { Types } from "mongoose";
import { AppError } from "./AppError";

export const parseObjectId = (value: unknown, label: string) => {
  if (typeof value !== "string") {
    throw new AppError(400, `${label} must be a valid ObjectId`);
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, `${label} must be a valid ObjectId`);
  }

  return new Types.ObjectId(value);
};
