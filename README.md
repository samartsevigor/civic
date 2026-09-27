# CIVIC MVP

Civic problem reporting PWA for Fredericton: public map + report flow + admin panel.

## Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Leaflet, Lucide
- **Backend:** NestJS, TypeORM, PostgreSQL
- **Photos:** local disk (`backend/uploads/issue-photos`)

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

## Quick start

1. Copy environment files:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Copy DB settings into `backend/.env` (default port **5433**, database **fixhack**). Adjust `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if needed.

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Backend setup:

```bash
cd backend
npm install
npm run seed
npm run start:dev
```

4. Frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Open:

- Citizen app: http://localhost:3000
- Admin: http://localhost:3000/admin (use `ADMIN_API_KEY` from `backend/.env`, default `dev-admin-key-change-me`)

## API overview

| Method | Path | Notes |
|--------|------|-------|
| GET | `/issues` | Query: `category`, `status`, `includeRejected` |
| GET | `/issues/:id` | Single issue |
| POST | `/issues` | `multipart/form-data`: `file`, `category`, `latitude`, `longitude`, `description?` |
| PATCH | `/issues/:id/confirm` | +1 confirmation |
| PATCH | `/issues/:id/status` | Header `X-Admin-Key`, body `{ "status": "in_progress" \| "resolved" \| "rejected" }` |
| DELETE | `/issues/:id` | Header `X-Admin-Key` |

Uploaded images are served from `http://localhost:3001/uploads/...`.

Swagger UI: http://localhost:3001/api

## Features

- PWA manifest (`/manifest.webmanifest`)
- Map filters by category and status, marker clustering, CARTO basemap
- Report flow with GPS fallback map, nearby duplicate hints, geocoded titles
- Confirmations stored per device fingerprint (`X-Device-Id`)
- Extended workflow statuses: reported → verified → sent_to_org → in_progress → resolved
- Admin analytics, inbox list, full status actions (admin key required for rejected feed)
- Rate limiting on create/confirm endpoints

## Demo smoke checklist

- [ ] Map loads centered on Fredericton with seeded pins (red/yellow/green)
- [ ] Category filters hide/show matching pins
- [ ] Report flow: photo + GPS/manual pin + submit → new red pin
- [ ] Issue modal: Confirm increments count; Share copies/opens link
- [ ] `/issue/{id}` opens map with issue details
- [ ] Admin: in progress → yellow pin; resolved → green; reject/delete updates map

## Scripts

Backend:

- `npm run start:dev` — API on port 3001
- `npm run seed` — migrations + demo data (skips if data exists)
- `npm run migration:run` — run TypeORM migrations only

Frontend:

- `npm run dev` — UI on port 3000
