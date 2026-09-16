# Person A ↔ Person B integration contract

> **Status:** Active — decisions below are locked unless both sides agree to change.
> See also [MERGE_CLOSEOUT.md](./MERGE_CLOSEOUT.md) for merge order and PR links.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| DB | **MongoDB** via Prisma (replica set required for `$transaction`) |
| ORM | Prisma |
| Auth | JWT (Bearer) + bcrypt |
| Email | Brevo (`BREVO_API_KEY`); console fallback in dev |
| Jobs | `node-cron` |

### Shared schema

- All `id` fields: Mongo `ObjectId` (`@default(auto()) @map("_id") @db.ObjectId`).
- No DB-level FK cascades — use `cascadeService.js`.
- Slot locks and artist+date claims use Prisma `$transaction` (replica set required).

## BookingStatus (canonical — both sides)

```
pending | hold | awaiting_payment | confirmed | cancelled | completed | no_artist_available_pending_admin
```

## Manual artist assignment

| Case | Endpoint |
|------|----------|
| Booking already has `eventId` | `POST /api/admin/events/{event_id}/assign-artist` |
| Pending-admin (`eventId` null) | `POST /api/admin/bookings/{booking_id}/assign-artist` |

## 1. `GET /internal/artists/available`

**Decision (locked):** response is **date-level artist availability**, sorted by `rating_avg` desc.  
**`available_slots` is intentionally omitted.** School/Corporate do not pick wall-clock slots; Individual bookings use `TimeSlot` via Person A’s own APIs.

**Auth:** `x-internal-api-key`

**Query:** `art_form`, `date` (`YYYY-MM-DD`)

**Response:**

```json
{
  "art_form": "Madhubani",
  "date": "2026-10-01",
  "artists": [
    {
      "id": "...",
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

**Rules:** `status=active`, matching `art_form`, no `available=false` timeslot that day, no active booking conflict that day, sorted by `rating_avg` desc.

## 2. Shared Event / Booking

- **Person A** owns writes to booking/payment/event creation for guest journeys.
- **Person B** reads bookings; may assign artist via the admin routes above.
- `Booking.eventId` is **optional** (null while `no_artist_available_pending_admin`).

## 3. `POST /internal/notifications/send`

Owned by Person B. Person A uses it (in-process) for OTP, booking confirmation, payment-window emails.
