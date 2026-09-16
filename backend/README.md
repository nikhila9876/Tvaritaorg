# Tvarita Backend — Person B

Artist auth & self-service, admin operations, feedback/moderation, and CSV onboarding.

## Tech stack

- **Node.js + Express 5**
- **Prisma + SQLite** (local/dev/test); switch `provider` to `postgresql` for production
- **JWT** auth (artist + admin roles)
- **bcryptjs** password hashing
- **Brevo** email (optional; console fallback)
- **node-cron** for 72h feedback auto-approve
- **Zod** validation, **Jest + Supertest** tests

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/health`

Default admin (from seed / `.env`):

- Email: `admin@tvarita.org`
- Password: `AdminPass123!`

## Modules

1. Artist auth & onboarding
2. Artist self-service
3. Feedback & moderation (+ 72h auto-approve)
4. Admin operations
5. Internal utilities (`/internal/*`)

See [docs/integration-person-a.md](./docs/integration-person-a.md) for the Person A contract.

## Tests

```bash
npm test
```

Covered: CSV email dedupe, feedback rate-limit, 72h auto-approve, `/internal/artists/available`.
