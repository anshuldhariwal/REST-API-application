import { Router } from "express";
import {
  bookSession,
  completeSession,
  createSession,
  getAvailableSessions
} from "../controllers/sessionController";
import { validateBody } from "../middleware/validate";
import { bookSessionSchema, createSessionSchema } from "../validation/schemas";

export const sessionRouter = Router();

sessionRouter.post("/", validateBody(createSessionSchema), createSession);
sessionRouter.get("/available", getAvailableSessions);
sessionRouter.post("/:id/book", validateBody(bookSessionSchema), bookSession);
sessionRouter.patch("/:id/complete", completeSession);
