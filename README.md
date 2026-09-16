# Tvarita NGO Platform — Corporate User Journey

Production-quality React frontend for the **Tvarita Arts Collective** (Tech for Social Good program).

Visual & editorial reference: [https://tvaritacollective.com/](https://tvaritacollective.com/)

---

## 🏛️ Implemented Corporate User Flow

The complete Corporate journey is implemented end-to-end:

```text
PUBLIC TVARITA WEBSITE
        ↓
DISCOVER (/corporate/experiences)
        ↓
EVENT / EXPERIENCE DETAILS (/corporate/experiences/:id)
        ↓
CORPORATE SIGNUP (/corporate/signup)
  (Name, Email, ORG_ID, Company Name)
        ↓
EMAIL OTP VERIFICATION (/corporate/verify-otp)
  (SMTP / console email contract)
        ↓
CORPORATE ACCOUNT CREATED & AUTHENTICATED
        ↓
CORPORATE DASHBOARD (/corporate/dashboard)
        ↓
PREVIEW EXPERIENCES & SELECT EVENT
        ↓
EVENT DETAILS & REGISTRATION MODAL
  (Participants selector, Company details, Notes)
        ↓
RAZORPAY PAYMENT (/corporate/payment)
  (Preparing, Processing, Verification, Success, Cancelled, Failed states)
        ↓
PAYMENT VERIFICATION
  (Authoritative backend check)
        ↓
REGISTRATION CONFIRMED (/corporate/confirmation)
  (Event Name, Date, Time, Location, Company Name, Participants, Amount Paid, Registration ID)
        ↓
CONFIRMATION EMAIL
  ("Confirmation email sent to your registered email address")
        ↓
CORPORATE DASHBOARD (/corporate/dashboard)
  (Upcoming Experience, My Registrations tabs, Payments & Receipts, Quick actions)
```

---

## 🚀 Routes Overview

| Route | Purpose | Access |
|---|---|---|
| `/` | Tvarita Cultural Homepage | Public |
| `/corporate/experiences` | Curated folk art experiences & workshops catalog | Public |
| `/corporate/experiences/:id` | Event details, cultural story, and registration | Public |
| `/corporate/signup` | Corporate signup (Name, Email, ORG_ID, Company Name) | Public |
| `/corporate/verify-otp` | 6-digit email OTP verification | Public |
| `/corporate/dashboard` | Corporate portal dashboard | Protected (Corporate) |
| `/corporate/registrations` | Registration history (Upcoming, Completed, Cancelled) | Protected (Corporate) |
| `/corporate/registrations/:id` | Registration voucher & printable receipt | Protected (Corporate) |
| `/corporate/payment` | Razorpay payment & authoritative verification | Protected (Corporate) |
| `/corporate/confirmation` | Booking confirmation & email dispatch notice | Protected (Corporate) |
| `/corporate/profile` | Company coordinator profile & verified credentials | Protected (Corporate) |
| `/corporate/notifications` | Session reminders, booking alerts, and schedule changes | Protected (Corporate) |

---

## 💳 Razorpay & Security

- **Public Key Only**: Frontend exposes only `VITE_RAZORPAY_KEY_ID`.
- **Backend Secrets**: `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` remain strictly on the backend.
- **Authoritative Confirmation**: Frontend never assumes payment success from the client; it requires server verification.

---

## ✉️ Email OTP Verification (nodemailer SMTP)

- **Backend-only SMTP secrets**: `SMTP_USER` / `SMTP_PASS` stay on the server — never in frontend `.env`.
- **Dev mode**: set `EMAIL_MODE=console` to log OTP/invite emails to the terminal.
- **Frontend Calls**: Proxies through backend auth OTP endpoints.
- **Resilience**: Development code `482910` or `123456` provided for offline/test environments.

---

## 🛠️ Quick Start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
