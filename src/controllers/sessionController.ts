import { Session, SessionStatus } from "../models/Session";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { dateRangeFromTimestamp } from "../utils/dateRange";
import { parseObjectId } from "../utils/objectId";

export const createSession = asyncHandler(async (req, res) => {
  const teacherId = parseObjectId(req.body.teacherId, "Teacher id");
  const teacherExists = await Teacher.exists({ _id: teacherId });

  if (!teacherExists) {
    throw new AppError(404, "Teacher not found");
  }

  if (req.body.endTime <= req.body.startTime) {
    throw new AppError(400, "endTime must be greater than startTime");
  }

  const session = await Session.create({
    teacherId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    status: SessionStatus.Available
  });

  res.status(201).json({ data: session });
});

export const getAvailableSessions = asyncHandler(async (req, res) => {
  const { startOfDay, endOfDay } = dateRangeFromTimestamp(String(req.query.dateTimestamp ?? ""));

  const sessions = await Session.aggregate([
    {
      $match: {
        status: SessionStatus.Available,
        startTime: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }
    },
    {
      $lookup: {
        from: "teachers",
        localField: "teacherId",
        foreignField: "_id",
        as: "teacher"
      }
    },
    {
      $unwind: "$teacher"
    },
    {
      $project: {
        teacherId: 1,
        userId: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        completedAt: 1,
        teacher: {
          _id: "$teacher._id",
          fullName: "$teacher.fullName",
          email: "$teacher.email",
          specialization: "$teacher.specialization",
          experience: "$teacher.experience"
        }
      }
    },
    {
      $sort: {
        startTime: 1
      }
    }
  ]);

  res.status(200).json({ data: sessions });
});

export const bookSession = asyncHandler(async (req, res) => {
  const sessionId = parseObjectId(req.params.id, "Session id");
  const userId = parseObjectId(req.body.userId, "User id");

  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new AppError(404, "User not found");
  }

  const sessionExists = await Session.exists({ _id: sessionId });

  if (!sessionExists) {
    throw new AppError(404, "Session not found");
  }

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      status: SessionStatus.Available
    },
    {
      $set: {
        status: SessionStatus.Booked,
        userId
      }
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!session) {
    throw new AppError(409, "Only available sessions can be booked");
  }

  res.status(200).json({ data: session });
});

export const completeSession = asyncHandler(async (req, res) => {
  const sessionId = parseObjectId(req.params.id, "Session id");
  const sessionExists = await Session.exists({ _id: sessionId });

  if (!sessionExists) {
    throw new AppError(404, "Session not found");
  }

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      status: SessionStatus.Booked
    },
    {
      $set: {
        status: SessionStatus.Completed,
        completedAt: new Date()
      }
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!session) {
    throw new AppError(409, "Only booked sessions can be marked as completed");
  }

  res.status(200).json({ data: session });
});
