import type { ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({
      message: "Validation failed",
      details: error.message
    });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    res.status(409).json({ message: "Duplicate resource" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
