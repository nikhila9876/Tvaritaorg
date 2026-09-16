# Tvarita Backend — Person B

Artist auth & self-service, admin operations, feedback/moderation, and CSV onboarding.

## Tech stack

- **Node.js + Express 5**
- **Prisma + MongoDB** (replica set required for `$transaction`)
- **JWT** auth (artist + admin roles)
- **bcryptjs** password hashing
- **Brevo** email (optional; console fallback)
- **node-cron** for 72h feedback auto-approve
- **Zod** validation, **Jest + Supertest** tests

## Quick start

### 1. MongoDB replica set (local)

Prisma interactive transactions need a replica set — even for local development:

```bash
# Example: single-node local replica set
mongod --replSet rs0 --port 27017
mongosh --eval "rs.initiate({_id:'rs0', members:[{_id:0, host:'127.0.0.1:27017'}]})"
```

Or use MongoDB Atlas (replica set is built-in).

### 2. App setup

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL=mongodb://127.0.0.1:27017/tvarita?replicaSet=rs0
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` runs `prisma generate && prisma db push && seed`.  
**Production / local indexes** come from Prisma `db push` (schema `@@unique` / `@@index` / `@unique`).  
Test-only Mongo driver index helpers in `tests/setup.js` are a workaround when `db push` cannot run in CI agents — they are not the production path.

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/health`

Default admin (from seed / `.env`):

- Email: `admin@tvarita.org`
- Password: `AdminPass123!`

## MongoDB notes (Person A / B)

- IDs are `ObjectId`. There are **no DB-level FK cascades**.
- Cascades: `src/services/cascadeService.js`.
- Merge order + assign-artist rules: [docs/MERGE_CLOSEOUT.md](./docs/MERGE_CLOSEOUT.md).
- Contract: [docs/integration-person-a.md](./docs/integration-person-a.md).

## Modules

1. Artist auth & onboarding (Person B)
2. Artist self-service (Person B)
3. Feedback & moderation (+ 72h auto-approve) (Person B)
4. Admin operations (Person B)
5. Internal utilities (`/internal/*`) (Person B)
6. Guest auth, discovery, bookings, payments (Person A)

## Tests

Tests spin up an in-memory MongoDB replica set (`mongodb-memory-server`):

```bash
npm test
```

Covered: CSV dedupe, feedback rate-limit, 72h auto-approve, available-artists, guest OTP, discovery, **concurrent slot/artist+date bookings**, payment webhook idempotency, admin status filters + pending-admin assign.