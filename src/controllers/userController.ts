import { Session, SessionStatus } from "../models/Session";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { parseObjectId } from "../utils/objectId";

export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ data: user });
});

export const getUserSessions = asyncHandler(async (req, res) => {
  const userId = parseObjectId(req.params.id, "User id");
  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new AppError(404, "User not found");
  }

  const [result] = await Session.aggregate([
    {
      $match: {
        userId
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
      $facet: {
        upcomingSessions: [
          {
            $match: {
              status: SessionStatus.Booked
            }
          },
          { $sort: { startTime: 1 } }
        ],
        completedSessions: [
          {
            $match: {
              status: SessionStatus.Completed
            }
          },
          { $sort: { completedAt: -1, startTime: -1 } }
        ]
      }
    }
  ]);

  res.status(200).json({
    data: result ?? {
      upcomingSessions: [],
      completedSessions: []
    }
  });
});
