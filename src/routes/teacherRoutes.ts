import { Router } from "express";
import { createTeacher } from "../controllers/teacherController";
import { validateBody } from "../middleware/validate";
import { createTeacherSchema } from "../validation/schemas";

export const teacherRouter = Router();

teacherRouter.post("/", validateBody(createTeacherSchema), createTeacher);
