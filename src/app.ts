import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { sessionRouter } from "./routes/sessionRoutes";
import { teacherRouter } from "./routes/teacherRoutes";
import { userRouter } from "./routes/userRoutes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Backend Assignment API</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 920px;
        margin: 40px auto;
        padding: 0 20px;
        color: #1f2937;
        line-height: 1.5;
      }
      code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 16px;
      }
      th,
      td {
        border: 1px solid #d1d5db;
        padding: 10px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #f9fafb;
      }
    </style>
  </head>
  <body>
    <h1>Backend Assignment API</h1>
    <p>Teacher session booking REST API built with Node.js, TypeScript, Express, MongoDB, and Mongoose.</p>
    <p>Health check: <a href="/health"><code>GET /health</code></a></p>
    <h2>Endpoints</h2>
    <table>
      <thead>
        <tr>
          <th>Method</th>
          <th>Path</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>POST</td><td><code>/users</code></td><td>Create a user with a unique email.</td></tr>
        <tr><td>POST</td><td><code>/teachers</code></td><td>Create a teacher for local testing and session ownership.</td></tr>
        <tr><td>POST</td><td><code>/sessions</code></td><td>Create an available session for a teacher.</td></tr>
        <tr><td>GET</td><td><code>/sessions/available?dateTimestamp={timestamp}</code></td><td>List available sessions for a date using aggregation.</td></tr>
        <tr><td>POST</td><td><code>/sessions/:id/book</code></td><td>Book an available session for a user.</td></tr>
        <tr><td>PATCH</td><td><code>/sessions/:id/complete</code></td><td>Mark a booked session as completed.</td></tr>
        <tr><td>GET</td><td><code>/users/:id/sessions</code></td><td>List a user's upcoming and completed sessions using aggregation.</td></tr>
      </tbody>
    </table>
    <h2>Demo</h2>
    <p>See <code>README.md</code> in the project root for the local run and verification sequence.</p>
  </body>
</html>`);
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/users", userRouter);
app.use("/teachers", teacherRouter);
app.use("/sessions", sessionRouter);

app.use(notFoundHandler);
app.use(errorHandler);
