import { Router } from "express";
import { createUser, getUserSessions } from "../controllers/userController";
import { validateBody } from "../middleware/validate";
import { createUserSchema } from "../validation/schemas";

export const userRouter = Router();

userRouter.post("/", validateBody(createUserSchema), createUser);
userRouter.get("/:id/sessions", getUserSessions);
