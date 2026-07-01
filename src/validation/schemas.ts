import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.email().toLowerCase(),
  phone: z.string().trim().min(1)
});

export const createTeacherSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.email().toLowerCase(),
  specialization: z.string().trim().min(1),
  experience: z.number().int().min(0)
});

export const createSessionSchema = z.object({
  teacherId: z.string().trim().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});

export const bookSessionSchema = z.object({
  userId: z.string().trim().min(1)
});
