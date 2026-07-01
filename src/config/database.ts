import mongoose from "mongoose";

export const connectDatabase = async (mongodbUri: string) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongodbUri);
};
