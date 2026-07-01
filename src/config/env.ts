import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a positive number");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  mongodbUri: process.env.MONGODB_URI
};
