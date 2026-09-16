# Per-tool auth requirements

Source of truth: Person A’s Express routers + `backend/src/middleware/auth.js` as of 2026-09-16
(after rebase onto `origin/main`). Cross-checked: **there is no `requireGuest` middleware in the
repo.** `requireAuth` / `requireArtist` / `requireAdmin` exist but are **not** mounted on any
route the chatbot calls. Guest JWT is issued by `POST /api/auth/guest/otp/verify` and is unused
on bookings/payments (Person A: “No middleware planned in code yet”).

Two layers (do not collapse them):

| Layer | What it means |
|---|---|
| **Backend HTTP** | Auth middleware on the Express route. For every chatbot endpoint today: **none**. |
| **AI-module policy** | Whether our tool handler refuses to call the API until `verify_otp` stored a session. |

`REQUIRES_SESSION` below is **AI-module policy** (we inject `guest_email` from the OTP session so
the model cannot spoof it). The HTTP API would still accept a body with `guest_email` and no JWT.

## Tool list

| Tool | Endpoint | Backend middleware | AI-module |
|---|---|---|---|
| `get_states` | `GET /api/states` | none | **ANONYMOUS** |
| `get_events_by_state` | `GET /api/states/:state_id/events` | none | **ANONYMOUS** |
| `get_event_detail` | `GET /api/events/:event_id` | none | **ANONYMOUS** |
| `get_event_artists` | `GET /api/events/:event_id/artists` | none | **ANONYMOUS** |
| `get_artist_timeslots` | `GET /api/artists/:artist_id/timeslots` | none (route not on git yet; Person A says public, no JWT) | **ANONYMOUS** |
| `request_otp` | `POST /api/auth/guest/otp/request` | none | **ANONYMOUS** (creates the session) |
| `verify_otp` | `POST /api/auth/guest/otp/verify` | none | **ANONYMOUS** (creates the session) |
| `create_individual_booking` | `POST /api/bookings/individual` | `validateBody` only | **REQUIRES_SESSION** |
| `create_school_booking` | `POST /api/bookings/school` | `validateBody` only | **ANONYMOUS** |
| `create_corporate_booking` | `POST /api/bookings/corporate` | `validateBody` only | **ANONYMOUS** |
| `get_booking_status` | `GET /api/bookings/:id/status` | none | **ANONYMOUS** |
| `create_payment` | `POST /api/payments/create` | `validateBody` only | **ANONYMOUS** |
| `get_payment_status` | `GET /api/payments/:id/status` | none | **ANONYMOUS** |
| `submit_feedback` | `POST /api/feedback` | `validateBody` only | **REQUIRES_SESSION** |
| `get_artist_feedback` | `GET /api/artists/:id/feedback` | none | **ANONYMOUS** |

## School / corporate payment (step 2 question)

**Yes — `create_payment` is fully anonymous for school and corporate.**

Evidence:

- `backend/src/routes/personA/payments.js` — `POST /create` has `validateBody(paymentCreateSchema)`
  only. No `requireAuth` / `requireGuest`.
- Body is `{ booking_id, idempotency_key? }`. No email. `createPayment()` loads the booking by id
  and allows status `hold | awaiting_payment | pending`.
- School/corporate success status is `awaiting_payment` (or pending-admin, which **cannot** pay —
  that is `PAYMENT_NOT_ALLOWED` / 409, not an auth failure).
- School/corporate booking tools never require a session; payment after them must not either.

The agent must **not** start OTP because a school/corporate user wants to pay.

## When the agent should trigger OTP

Only:

1. `create_individual_booking` (needs `guest_email` from `verify_otp`)
2. `submit_feedback` (same — we inject `guest_email`)

Never for discovery, school/corporate booking, payment create/status, booking status, or public feedback list.

## Flagged (do not guess)

1. **Backend is weaker than the chatbot.** Individual booking and feedback HTTP APIs accept
   `guest_email` in the body with **no JWT**. Our tools are stricter. If Person A later adds
   `requireGuest`, our policy already matches; until then this is AI-module-only.
2. **`create_payment` has no identity check at all.** Anyone who knows a `booking_id` can start
   payment (individual or org). We do not add a session gate; that would invent auth Person A
   did not ship. Worth Person A’s awareness, not a chatbot workaround.
3. **`get_booking_status` / `get_payment_status` are public by id.** Same: no owner check.
4. **Individual `create_payment`:** also ANONYMOUS on the backend. After an individual booking the
   session already exists, but payment itself must not *require* OTP if a `booking_id` is in hand.
5. **`get_artist_timeslots`:** Person A said public/no JWT; route still not on git. Left as-is
   (expected 404 until they push).

## Example transcripts (manual; not an automated test)

### a) Individual booking — OTP is required

```
User: I want to book Meera's 10:00 slot on 2026-10-20.
Agent: [get_artist_timeslots] → show slots, confirm slot_id
Agent: [create_individual_booking] → NOT_AUTHENTICATED / requires_auth
Agent: I'll email you a code. What's your email?
User: guest@example.com
Agent: [request_otp { email }]
User: 482910
Agent: [verify_otp { email, otp }] → session stored
Agent: [create_individual_booking { artist_id, slot_id }] → 201 hold
Agent: [create_payment { booking_id }]  ← no second OTP
```

Correct: OTP only because individual booking needs session-injected `guest_email`. Payment after
that does not start a new OTP flow.

### b) School booking — OTP is skipped

```
User: Book a Gond workshop for our school on 2026-12-01, 40 students.
Agent: I need the school's registered email (admin CSV), not a guest OTP.
User: school@example.com
Agent: [create_school_booking { school_email, art_form: Gond, date: 2026-12-01, headcount: 40 }]
       → 201 awaiting_payment (or no_artist_available_pending_admin)
Agent: [create_payment { booking_id }]   ← still no OTP
Agent: [get_booking_status { booking_id }]
```

Incorrect (must not happen): `request_otp` / `verify_otp` anywhere in this flow.

Corporate is the same as (b) with `corporate_email`.
