import { AppError } from "./AppError";

export const dateRangeFromTimestamp = (timestamp: string) => {
  const numericTimestamp = Number(timestamp);

  if (!timestamp || Number.isNaN(numericTimestamp)) {
    throw new AppError(400, "dateTimestamp must be a valid timestamp");
  }

  const date = new Date(numericTimestamp);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "dateTimestamp must be a valid timestamp");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return { startOfDay, endOfDay };
};
