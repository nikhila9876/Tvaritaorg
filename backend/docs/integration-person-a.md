# Person A ↔ Person B integration contract (provisional)

> **Status:** Provisional until Person A confirms field names/response shapes.
> Do not change without syncing with Person A.

## Stack (Person B)

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| DB | **MongoDB** via Prisma (replica set required for `$transaction`) |
| ORM | Prisma |
| Auth | JWT (Bearer) + bcrypt password hashes |
| Email | Brevo (`BREVO_API_KEY`); console fallback in dev |
| CSV | `csv-parse` + multer |
| Jobs | `node-cron` (hourly feedback auto-approve) |

### Shared schema / ObjectIds (Person A must review before merge)

- All model `id` fields are Mongo `ObjectId` (`@default(auto()) @map("_id") @db.ObjectId`).
- FK fields (`artistId`, `eventId`, `bookingId`, etc.) are `String @db.ObjectId`.
- **No DB-level cascades.** Use `deleteArtistWithCascade` / `deleteEventWithCascade` in `src/services/cascadeService.js`.
- Atomic slot-lock on `artist_id + slot_id` must run inside a Prisma transaction against a **replica set**.

## 1. `GET /internal/artists/available`

Used by Person A's Corporate/School auto-assignment.

**Auth:** header `x-internal-api-key: <INTERNAL_API_KEY>`

**Query**

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `art_form` | string | yes | `Madhubani` |
| `date` | `YYYY-MM-DD` | yes | `2026-10-01` |

**Response `200`**

```json
{
  "art_form": "Madhubani",
  "date": "2026-10-01",
  "artists": [
    {
      "id": "clx...",
      "name": "High Rated",
      "email": "high@example.com",
      "art_form": "Madhubani",
      "region": "Bihar",
      "rating_avg": 4.8,
      "rating_count": 10,
      "status": "active"
    }
  ]
}
```

**Rules**

- Only `status=active`
- Matching `art_form` (exact)
- No conflicting timeslot (`available=false` on that date)
- No pending/confirmed booking on an event with that date
- Sorted by `rating_avg` descending (approved feedback only feeds live rating)

## 2. Shared `Booking` / `Event` tables

- **Person A** owns writes to booking state (create/update status/payments).
- **Person B** reads for `GET /api/admin/bookings` and `GET /api/artist/me/bookings`.
- **Person B** may write `artistId` via `POST /api/admin/events/{event_id}/assign-artist` (manual reassignment).

### Booking fields (Person B schema)

| Field | Notes |
|-------|-------|
| `id` | Mongo ObjectId |
| `eventId` | FK → Event |
| `artistId` | nullable until assigned |
| `guestEmail`, `guestName`, `organization` | optional |
| `bookingType` | e.g. `corporate`, `school`, `guest` |
| `status` | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| `grossAmount` | number; artist share = 70% |

Please confirm naming (`camelCase` in DB / `snake_case` in JSON API) before Person A locks their write path.

## 3. `POST /internal/notifications/send`

Owned by Person B; Person A may call for booking confirmations if desired.

**Auth:** `x-internal-api-key`

```json
{
  "channel": "email",
  "to": "user@example.com",
  "template": "artist_set_password",
  "data": { "name": "...", "link": "..." }
}
```
