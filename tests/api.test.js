const assert = require("node:assert/strict");
const { after, before, beforeEach, describe, it } = require("node:test");
const mongoose = require("mongoose");

const { app } = require("../dist/app");

const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/backend-assignment-test";

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    body
  };
};

const postJson = (path, body) =>
  request(path, {
    method: "POST",
    body: JSON.stringify(body)
  });

const patchJson = (path, body) =>
  request(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body)
  });

const createUser = async (suffix = Date.now()) => {
  const response = await postJson("/users", {
    fullName: "Test User",
    email: `user.${suffix}@example.com`,
    phone: "9999999999"
  });

  assert.equal(response.status, 201);
  return response.body.data;
};

const createTeacher = async (suffix = Date.now()) => {
  const response = await postJson("/teachers", {
    fullName: "Test Teacher",
    email: `teacher.${suffix}@example.com`,
    specialization: "Mathematics",
    experience: 5
  });

  assert.equal(response.status, 201);
  return response.body.data;
};

const createSession = async (teacherId, startTime = "2026-07-02T10:00:00.000Z") => {
  const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
  const response = await postJson("/sessions", {
    teacherId,
    startTime,
    endTime
  });

  assert.equal(response.status, 201);
  return response.body.data;
};

before(async () => {
  await mongoose.connect(TEST_MONGODB_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

describe("docs and health", () => {
  it("serves the root docs page", async () => {
    const response = await request("/");

    assert.equal(response.status, 200);
    assert.match(response.body, /Backend Assignment API/);
    assert.match(response.body, /\/sessions\/available/);
  });

  it("returns health status", async () => {
    const response = await request("/health");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request("/missing-route");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Route not found: GET /missing-route");
  });
});

describe("users", () => {
  it("creates a user", async () => {
    const user = await createUser("create");

    assert.equal(user.fullName, "Test User");
    assert.equal(user.email, "user.create@example.com");
    assert.ok(user._id);
    assert.ok(user.createdAt);
  });

  it("rejects duplicate user email", async () => {
    await createUser("duplicate");
    const response = await postJson("/users", {
      fullName: "Duplicate User",
      email: "user.duplicate@example.com",
      phone: "8888888888"
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Duplicate resource");
  });

  it("rejects invalid user payload", async () => {
    const response = await postJson("/users", {
      fullName: "",
      email: "not-an-email",
      phone: ""
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Validation failed");
  });
});

describe("teachers", () => {
  it("creates a teacher", async () => {
    const teacher = await createTeacher("create");

    assert.equal(teacher.fullName, "Test Teacher");
    assert.equal(teacher.email, "teacher.create@example.com");
    assert.equal(teacher.specialization, "Mathematics");
    assert.equal(teacher.experience, 5);
  });

  it("rejects invalid teacher payload", async () => {
    const response = await postJson("/teachers", {
      fullName: "",
      email: "invalid",
      specialization: "",
      experience: -1
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Validation failed");
  });
});

describe("sessions", () => {
  it("creates an available session for an existing teacher", async () => {
    const teacher = await createTeacher("session-create");
    const session = await createSession(teacher._id);

    assert.equal(session.teacherId, teacher._id);
    assert.equal(session.userId, null);
    assert.equal(session.status, "AVAILABLE");
    assert.equal(session.completedAt, null);
  });

  it("rejects session creation when teacher does not exist", async () => {
    const response = await postJson("/sessions", {
      teacherId: new mongoose.Types.ObjectId().toString(),
      startTime: "2026-07-02T10:00:00.000Z",
      endTime: "2026-07-02T11:00:00.000Z"
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Teacher not found");
  });

  it("rejects session creation with invalid teacher id", async () => {
    const response = await postJson("/sessions", {
      teacherId: "invalid-id",
      startTime: "2026-07-02T10:00:00.000Z",
      endTime: "2026-07-02T11:00:00.000Z"
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Teacher id must be a valid ObjectId");
  });

  it("rejects session creation when endTime is not after startTime", async () => {
    const teacher = await createTeacher("bad-time");
    const response = await postJson("/sessions", {
      teacherId: teacher._id,
      startTime: "2026-07-02T11:00:00.000Z",
      endTime: "2026-07-02T10:00:00.000Z"
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "endTime must be greater than startTime");
  });

  it("lists available sessions for a date using aggregation", async () => {
    const teacher = await createTeacher("available");
    const availableSession = await createSession(teacher._id, "2026-07-02T10:00:00.000Z");
    await createSession(teacher._id, "2026-07-03T10:00:00.000Z");

    const dateTimestamp = new Date("2026-07-02T00:00:00.000Z").getTime();
    const response = await request(`/sessions/available?dateTimestamp=${dateTimestamp}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0]._id, availableSession._id);
    assert.equal(response.body.data[0].teacher.fullName, "Test Teacher");
  });

  it("rejects invalid available sessions timestamp", async () => {
    const response = await request("/sessions/available?dateTimestamp=invalid");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "dateTimestamp must be a valid timestamp");
  });

  it("books an available session and prevents double booking", async () => {
    const user = await createUser("book");
    const teacher = await createTeacher("book");
    const session = await createSession(teacher._id);

    const booked = await postJson(`/sessions/${session._id}/book`, {
      userId: user._id
    });

    assert.equal(booked.status, 200);
    assert.equal(booked.body.data.status, "BOOKED");
    assert.equal(booked.body.data.userId, user._id);

    const duplicateBooking = await postJson(`/sessions/${session._id}/book`, {
      userId: user._id
    });

    assert.equal(duplicateBooking.status, 409);
    assert.equal(duplicateBooking.body.message, "Only available sessions can be booked");
  });

  it("rejects booking with missing user", async () => {
    const teacher = await createTeacher("missing-user");
    const session = await createSession(teacher._id);
    const response = await postJson(`/sessions/${session._id}/book`, {
      userId: new mongoose.Types.ObjectId().toString()
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "User not found");
  });

  it("rejects booking with missing session", async () => {
    const user = await createUser("missing-session");
    const response = await postJson(`/sessions/${new mongoose.Types.ObjectId()}/book`, {
      userId: user._id
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Session not found");
  });

  it("completes a booked session and prevents completing it twice", async () => {
    const user = await createUser("complete");
    const teacher = await createTeacher("complete");
    const session = await createSession(teacher._id);
    await postJson(`/sessions/${session._id}/book`, {
      userId: user._id
    });

    const completed = await patchJson(`/sessions/${session._id}/complete`);

    assert.equal(completed.status, 200);
    assert.equal(completed.body.data.status, "COMPLETED");
    assert.ok(completed.body.data.completedAt);

    const secondCompletion = await patchJson(`/sessions/${session._id}/complete`);

    assert.equal(secondCompletion.status, 409);
    assert.equal(secondCompletion.body.message, "Only booked sessions can be marked as completed");
  });

  it("rejects completing an available session", async () => {
    const teacher = await createTeacher("complete-available");
    const session = await createSession(teacher._id);
    const response = await patchJson(`/sessions/${session._id}/complete`);

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Only booked sessions can be marked as completed");
  });
});

describe("user sessions aggregation", () => {
  it("returns upcoming and completed sessions for a user", async () => {
    const user = await createUser("history");
    const teacher = await createTeacher("history");
    const upcomingSession = await createSession(teacher._id, "2026-07-02T10:00:00.000Z");
    const completedSession = await createSession(teacher._id, "2026-07-03T10:00:00.000Z");

    await postJson(`/sessions/${upcomingSession._id}/book`, {
      userId: user._id
    });

    await postJson(`/sessions/${completedSession._id}/book`, {
      userId: user._id
    });
    await patchJson(`/sessions/${completedSession._id}/complete`);

    const response = await request(`/users/${user._id}/sessions`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.upcomingSessions.length, 1);
    assert.equal(response.body.data.completedSessions.length, 1);
    assert.equal(response.body.data.upcomingSessions[0]._id, upcomingSession._id);
    assert.equal(response.body.data.completedSessions[0]._id, completedSession._id);
    assert.equal(response.body.data.completedSessions[0].teacher.specialization, "Mathematics");
  });

  it("rejects user sessions request with invalid user id", async () => {
    const response = await request("/users/invalid-id/sessions");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "User id must be a valid ObjectId");
  });

  it("rejects user sessions request when user does not exist", async () => {
    const response = await request(`/users/${new mongoose.Types.ObjectId()}/sessions`);

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "User not found");
  });
});
