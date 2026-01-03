# TaskFlow-Pro Copilot Instructions

## Repo layout (monorepo)
- Web app (Vite + React): `src/` (router in `src/App.tsx`, state in `src/store/useStore.ts`, API client in `src/api/client.ts`)
- API (Express + Prisma): `server/src/` (entrypoint `server/src/index.ts`, routers in `server/src/routes/*.ts`)
- Database: Postgres + Prisma (`server/prisma/schema.prisma`), local Postgres via `docker-compose.yml`

## Local dev (most common)
- Start Postgres: `docker compose up -d` (DB on `localhost:55432`)
- Start API: `npm --prefix server run dev` (tsx watch, default `PORT=4000`)
- Start web: `npm run dev` (Vite, default `http://localhost:5173`)
- VS Code tasks exist: **Dev: API** and **Dev: Web**

## Environment config
- API reads `server/.env` via `server/src/env.ts` (requires `DATABASE_URL` + `JWT_SECRET`).
- Email is optional: if `SMTP_*` is unset, `server/src/email.ts` logs a `[email:mock]` payload to the server console (verification links still work).
- Verification links use `APP_BASE_URL` (see `server/src/routes/auth.ts`).

## API conventions (important)
- All routers are mounted under `/api` in `server/src/index.ts`.
- Auth:
  - `requireAuth` parses `Authorization: Bearer <token>` and sets `(req as any).auth` (see `server/src/auth.ts`).
  - Admin endpoints additionally use `requireAdmin` (see `server/src/routes/admin.ts`).
- Error handling:
  - Throw `new HttpError(status, message, details?)` from route handlers.
  - `errorMiddleware` returns JSON `{ error, details }` (see `server/src/httpErrors.ts`).
- Validation:
  - Use Zod `.parse(req.body)` with schemas in `server/src/validation.ts`.

## Data mapping “gotchas” (don’t break these)
- Task status strings differ between UI and DB:
  - UI/API uses `'in-progress'`
  - Prisma enum is `'in_progress'`
  - Always convert via `mapStatusToDb`/`mapStatusFromDb` in `server/src/mappers.ts`.
- `dueDate` format:
  - Frontend sends `YYYY-MM-DD` (or ISO datetime).
  - API stores as `Date` and maps back to `YYYY-MM-DD` (see `server/src/routes/tasks.ts` + `server/src/mappers.ts`).

## Frontend conventions
- API base URL comes from `VITE_API_BASE_URL` (default `http://localhost:4000/api`).
- Auth token is stored in localStorage key `taskflow_token` and sent as `Authorization: Bearer ...` (see `src/api/client.ts`).
- App boot sequence: `initAuth()` then `checkApi()`; when authenticated, the store hydrates workspaces then categories/tasks/activities (see `src/App.tsx` and `src/store/useStore.ts`).
- Use the Vite alias `@/…` for imports (configured in `vite.config.ts`).

## TypeScript/ESM note (server)
- The API is ESM (`server/package.json` has `type: module`) and internal imports use `.js` extensions (e.g. `./env.js`). Preserve this pattern when adding/editing server files.

## Prisma workflows
- Generate client: `npm --prefix server run prisma:generate`
- Migrate dev DB: `npm --prefix server run prisma:migrate`
- Seed: `npm --prefix server run seed`
