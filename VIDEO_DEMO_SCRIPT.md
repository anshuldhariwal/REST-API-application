# 5 Minute Video Demo Script

Use this as a recording guide for a short backend assignment walkthrough.

## Goal

Show that the project satisfies the assignment requirements:

- Node.js, TypeScript, Express, MongoDB, and Mongoose.
- User, Teacher, and Session schemas.
- Session booking flow.
- Aggregation APIs.
- Validation, status codes, environment config, and local setup.

## Before Recording

Make sure MongoDB is running:

```powershell
Get-Service MongoDB
```

Build and start the API:

```bash
npm run build
npm start
```

Optional test proof before recording:

```bash
npm test
```

Open:

```text
http://localhost:3001
```

Prepare Postman with `postman_collection.json` imported.

## 0:00 - 0:30 Project Overview

Show the project folder.

Say:

> This is a backend-only REST API for a teacher session booking platform. It uses Node.js, TypeScript, Express, MongoDB, and Mongoose. Users can book sessions created for teachers, and completed sessions appear in the user's session history.

Point out:

- `src/`
- `README.md`
- `DEMO.md`
- `postman_collection.json`
- `.env.example`

## 0:30 - 1:00 Local Setup And Health Check

Show `.env.example`:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/backend-assignment
NODE_ENV=development
```

Say:

> Runtime configuration is environment-based. The real `.env` is ignored, and dependencies are local to this project.

Show the browser:

```text
http://localhost:3001
```

Then show:

```text
http://localhost:3001/health
```

Expected:

```json
{
  "status": "ok"
}
```

## 1:00 - 1:45 Code Structure

Show `src/app.ts`.

Point out:

- Express app setup.
- JSON middleware.
- Root docs page.
- `/health`.
- Route registration.
- Centralized not-found and error handlers.

Show folders:

- `models`
- `controllers`
- `routes`
- `middleware`
- `validation`
- `config`
- `utils`

Say:

> The code is split by responsibility: routes define HTTP entry points, controllers hold request logic, models define MongoDB documents, validation handles request body checks, and middleware centralizes errors.

## 1:45 - 2:20 Data Models

Show:

- `src/models/User.ts`
- `src/models/Teacher.ts`
- `src/models/Session.ts`

Say:

> The assignment requires User, Teacher, and Session schemas. Session stores `teacherId`, optional `userId`, `startTime`, `endTime`, `status`, and `completedAt`. Status is restricted to AVAILABLE, BOOKED, and COMPLETED.

Point out:

- User email is unique.
- Session has indexes for status/date and user session queries.
- Session status enum.

## 2:20 - 4:20 Postman API Flow

Use Postman or another REST client.

### 1. Create User

Request:

```http
POST http://localhost:3001/users
```

Body:

```json
{
  "fullName": "Demo User",
  "email": "demo.user@example.com",
  "phone": "9999999999"
}
```

Show `201 Created`.

Copy the returned user `_id`.

### 2. Create Teacher

Request:

```http
POST http://localhost:3001/teachers
```

Body:

```json
{
  "fullName": "Demo Teacher",
  "email": "demo.teacher@example.com",
  "specialization": "Mathematics",
  "experience": 6
}
```

Show `201 Created`.

Copy the returned teacher `_id`.

Say:

> This helper endpoint exists so session creation can validate that a teacher exists.

### 3. Create Session

Request:

```http
POST http://localhost:3001/sessions
```

Body:

```json
{
  "teacherId": "PASTE_TEACHER_ID",
  "startTime": "2026-07-02T10:00:00.000Z",
  "endTime": "2026-07-02T11:00:00.000Z"
}
```

Show:

- `201 Created`
- `status` is `AVAILABLE`
- `userId` is `null`

Copy the returned session `_id`.

### 4. Available Sessions Aggregation

Request:

```http
GET http://localhost:3001/sessions/available?dateTimestamp=1782957600000
```

Show the created session in the response.

Say:

> This endpoint is implemented with a MongoDB aggregation pipeline, as required. It filters available sessions for the supplied date and joins teacher information.

### 5. Book Session

Request:

```http
POST http://localhost:3001/sessions/PASTE_SESSION_ID/book
```

Body:

```json
{
  "userId": "PASTE_USER_ID"
}
```

Show:

- `200 OK`
- `status` changes to `BOOKED`
- `userId` is assigned

### 6. Double Booking Validation

Run the same booking request again.

Expected:

```json
{
  "message": "Only available sessions can be booked"
}
```

Status:

```text
409 Conflict
```

Say:

> Booking uses a conditional MongoDB update, so double-booking is rejected safely.

### 7. Complete Session

Request:

```http
PATCH http://localhost:3001/sessions/PASTE_SESSION_ID/complete
```

Show:

- `200 OK`
- `status` changes to `COMPLETED`
- `completedAt` is set

### 8. User Sessions Aggregation

Request:

```http
GET http://localhost:3001/users/PASTE_USER_ID/sessions
```

Show:

- `upcomingSessions`
- `completedSessions`
- completed session appears under `completedSessions`

Say:

> This endpoint also uses MongoDB aggregation. It returns the user's sessions split into upcoming and completed groups.

## 4:20 - 4:50 Error Handling And Validation

Show one quick invalid request, for example create a session with an invalid teacher id:

```json
{
  "teacherId": "invalid-id",
  "startTime": "2026-07-02T10:00:00.000Z",
  "endTime": "2026-07-02T11:00:00.000Z"
}
```

Expected:

```text
400 Bad Request
```

Say:

> Errors are returned consistently through centralized middleware. Validation failures, missing resources, duplicate emails, and conflict states use appropriate HTTP status codes.

## 4:50 - 5:00 Closing

Say:

> That completes the required flow: user creation, teacher-backed session creation, available session lookup with aggregation, booking, completion, and user session history with aggregation. The project includes README setup steps, a demo guide, environment configuration, and a Postman collection for testing.

## Backup If Postman Variables Are Not Ready

Use the response IDs manually:

- Copy user `_id` after `POST /users`.
- Copy teacher `_id` after `POST /teachers`.
- Copy session `_id` after `POST /sessions`.

Then paste them into later requests.
