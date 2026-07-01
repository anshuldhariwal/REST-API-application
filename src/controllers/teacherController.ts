import { Teacher } from "../models/Teacher";
import { asyncHandler } from "../utils/asyncHandler";

export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.create(req.body);
  res.status(201).json({ data: teacher });
});
