# Tvarita Backend — Person B

Artist auth & self-service, admin operations, feedback/moderation, and CSV onboarding.

## Tech stack

- **Node.js + Express 5**
- **Prisma + MongoDB** (replica set required for `$transaction`)
- **JWT** auth (artist + admin roles)
- **bcryptjs** password hashing
- **nodemailer** SMTP (`EMAIL_MODE=console` logs emails; `smtp` sends)
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
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/health`

Default admin (from seed / `.env`):

- Email: `admin@tvarita.org`
- Password: `AdminPass123!`

## MongoDB notes (Person A)

- IDs are `ObjectId` (`@db.ObjectId`). There are **no DB-level FK cascades**.
- Cascades are applied in `src/services/cascadeService.js` (`deleteArtistWithCascade`, `deleteEventWithCascade`).
- Any atomic slot-lock on `artist_id + slot_id` must use a Prisma/`$transaction` against a **replica set**.

## Modules

1. Artist auth & onboarding
2. Artist self-service
3. Feedback & moderation (+ 72h auto-approve)
4. Admin operations
5. Internal utilities (`/internal/*`)

See [docs/integration-person-a.md](./docs/integration-person-a.md) for the Person A contract.

## Tests

Tests spin up an in-memory MongoDB replica set (`mongodb-memory-server`):

```bash
npm test
```

Covered: CSV email dedupe, feedback rate-limit, 72h auto-approve, `/internal/artists/available`.
