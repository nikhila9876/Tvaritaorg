# Tvarita NGO Platform — Frontend

A production-quality React frontend for the **Tvarita Arts Collective** NGO platform.

## Stack
- **React 18** + JavaScript
- **Vite** (build tool)
- **React Router v6** (routing)
- **Axios** (API client)
- **Lucide React** (icons)
- **IDB** (IndexedDB for offline support)

## Setup

```bash
cd frontend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

## Environment Variables

See [`frontend/.env.example`](frontend/.env.example) for all required variables.

**Never** put backend secrets in the frontend `.env` files.

## Roles
- **Public** — cultural website, artist discovery, events, marketplace
- **NGO Admin** — full platform management + Impact & Funding Manager
- **Artist** — mobile-first dashboard, bookings, earnings, knowledge
- **School** — browse programs, book workshops, pay via Razorpay
- **Corporate** — browse experiences, request customization, pay via Razorpay

## GitHub Workflow
All features are implemented on `feature-<name>` branches, opened as PRs to `main`.
