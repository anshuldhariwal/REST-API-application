# Demo And Local Run Guide

This project is a backend-only REST API. It does not include a frontend.

## 1. Confirm MongoDB Is Running

MongoDB should be installed as a Windows service.

```powershell
Get-Service MongoDB
```

Expected status:

```text
Running
```

If it is stopped:

```powershell
Start-Service MongoDB
```

## 2. Install Project Dependencies

Run from the project root:

```bash
npm install
```

Dependencies install into this project's local `node_modules` folder.

## 3. Confirm Environment File

The local `.env` should contain:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/backend-assignment
NODE_ENV=development
```

If `.env` is missing:

```powershell
Copy-Item .env.example .env
```

## 4. Build The Project

```bash
npm run build
```

Expected result: TypeScript compiles into the `dist` folder without errors.

Optional automated verification:

```bash
npm test
```

The test suite runs against `backend-assignment-test`, not the demo database.

## 5. Start The API

```bash
npm start
```

Expected output:

```text
API running on port 3001
```

Leave this terminal running while testing the API.

## 6. Open The Local Docs Page

Open this URL in a browser:

```text
http://localhost:3001
```

Expected result: a simple API documentation page listing the available endpoints.

## 7. Check API Health

Open this URL:

```text
http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## 8. Verify With Postman Later

Import `postman_collection.json` into Postman when you want to test the full API flow manually.

Recommended request sequence:

1. `POST /users`
2. `POST /teachers`
3. `POST /sessions`
4. `GET /sessions/available?dateTimestamp={timestamp}`
5. `POST /sessions/:id/book`
6. `PATCH /sessions/:id/complete`
7. `GET /users/:id/sessions`

## Notes

- The API uses port `3001` so other local projects can keep using port `3000`.
- The real `.env` file is intentionally ignored by Git.
- Use `npm run typecheck` for a no-output TypeScript verification pass.
