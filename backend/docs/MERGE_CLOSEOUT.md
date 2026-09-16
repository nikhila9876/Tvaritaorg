# Person A ↔ Person B — merge close-out

## 1. Merge order (required)

Merge **exactly** in this order — later branches depend on earlier schema:

1. `feature/person-b-artist-auth` → **`main`**
2. `feature/person-b-mongodb-migration` → **`feature/person-b-artist-auth`** (then fast-forward / merge into `main`)
3. `feature/person-a-guest-auth` → **`feature/person-b-mongodb-migration`** (then into `main`)

Do **not** merge Person A into `main` before MongoDB migration lands.

## 2. Open PRs (compare links)

| # | Branch | Base | Compare |
|---|--------|------|---------|
| 1 | `feature/person-b-artist-auth` | `main` | https://github.com/nikhila9876/Tvaritaorg/compare/main...feature/person-b-artist-auth?expand=1 |
| 2 | `feature/person-b-mongodb-migration` | `feature/person-b-artist-auth` | https://github.com/nikhila9876/Tvaritaorg/compare/feature/person-b-artist-auth...feature/person-b-mongodb-migration?expand=1 |
| 3 | `feature/person-a-guest-auth` | `feature/person-b-mongodb-migration` | https://github.com/nikhila9876/Tvaritaorg/compare/feature/person-b-mongodb-migration...feature/person-a-guest-auth?expand=1 |

`gh auth login` requires interactive browser approval (device code). After login:

```bash
gh pr create --base main --head feature/person-b-artist-auth --title "..."
gh pr create --base feature/person-b-artist-auth --head feature/person-b-mongodb-migration --title "..."
gh pr create --base feature/person-b-mongodb-migration --head feature/person-a-guest-auth --title "..."
```

## 3. Schema overlap — Person A additions that touch Person B models

| Change | Owner writes | Person B impact |
|--------|--------------|-----------------|
| `Booking.eventId` → **optional** | Person A | Admin/artist booking reads must tolerate `event: null` |
| `BookingStatus` +`hold`, `awaiting_payment`, `no_artist_available_pending_admin` | Shared enum | Admin list/filters must accept new values |
| `Booking` fields: `slotId`, `headcount`, `holdExpiresAt`, `paymentWindowExpiresAt`, `schoolId`, `corporateId`, `artForm`, `date` | Person A | Read-only for Person B |
| `TimeSlot.lockedUntil`, `lockedByBookingId` | Person A | Person B timeslot PUT should not wipe active locks carelessly |
| `Event.stateId` | Person A (discovery) | Optional on Event |
| New models: `State`, `Guest`, `GuestOtp`, `Payment`, `ArtistDateHold` | Person A | Person B should not write |
| Mongo ObjectIds (from Person B migration) | Person B | Person A depends on this |

### Person B review confirmation (required before merge)

> **Status: PENDING human Person B sign-off**  
> The schema diff above must be explicitly acknowledged by whoever owns Person B before merging PR #3.  
> Do not treat this agent session as that confirmation.

Checklist for Person B reviewer:

- [ ] Optional `eventId` accepted
- [ ] New `BookingStatus` values accepted as canonical
- [ ] Pending-admin assign uses `POST /api/admin/bookings/{booking_id}/assign-artist`
- [ ] `GET /internal/artists/available` remains date-level (no `available_slots`) by design

## 4. Canonical booking statuses

Single source: Prisma `enum BookingStatus` (and JSON API snake_case):

| Value | Meaning |
|-------|---------|
| `pending` | Generic pending |
| `hold` | Individual slot locked, awaiting payment (10 min) |
| `awaiting_payment` | Artist assigned; payment window open (48h for org after manual assign) |
| `confirmed` | Paid / confirmed |
| `cancelled` | Cancelled / hold expired |
| `completed` | Completed |
| `no_artist_available_pending_admin` | School/Corporate auto-assign found nobody |

No humanized variants (e.g. `"no artist available - pending admin"`) are used in code.

## 5. Assign-artist + optional eventId

| Route | Works for pending-admin (`eventId=null`)? | Owner |
|-------|-------------------------------------------|-------|
| `POST /api/admin/events/{event_id}/assign-artist` | **No** — returns 404 with hint to booking path | Person B endpoint; clarified on shared branch |
| `POST /api/admin/bookings/{booking_id}/assign-artist` | **Yes** — creates Event, opens 48h window | Person A (mounted on admin router) |

## 6. `available_slots` decision

**Date-level matching is sufficient by design** for School/Corporate auto-assignment.

- Individual bookings pick a concrete `TimeSlot` (`slot_id`).
- School/Corporate assign an **artist for a date** via `ArtistDateHold`, not a wall-clock slot.
- `GET /internal/artists/available` will **not** add `available_slots`.

Documented in `integration-person-a.md`.

## 7. Production indexes

`npm run db:setup` → `prisma generate && prisma db push && seed`.

Prisma `db push` against MongoDB creates collections **and** indexes declared via `@@unique` / `@@index` / `@unique` in `schema.prisma`.

Test setup creates indexes via the Mongo driver only because `prisma db push` hangs in this agent environment — that path is **test-only**, not production.
