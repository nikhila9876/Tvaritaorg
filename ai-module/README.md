# Tvarita AI Module

AI/chatbot layer for the **Tvarita Arts Platform** — an MCP server wrapping the backend REST API, plus a conversational agent for guest discovery and booking.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Chatbot Agent (agent.js)                   │
│  OpenRouter + Gemma 4 function-calling loop │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │  MCP Server (mcp-server.js)            │ │
│  │                                        │ │
│  │  Tools:                                │ │
│  │  ├── discovery (5 public endpoints)    │ │
│  │  ├── auth (OTP request/verify)         │ │
│  │  ├── booking (individual/school/corp)  │ │
│  │  ├── payments (create + status)        │ │
│  │  └── feedback (submit + public list)   │ │
│  └────────────────────────────────────────┘ │
│                 │                            │
│           api-client.js                      │
│           session-store.js                   │
└─────────────────────────────────────────────┘
                  │
                  ▼
    Tvarita Backend REST API
    (http://localhost:5000/api)
```

## Setup

```bash
cd ai-module
cp .env.example .env
# Edit .env — set BACKEND_API_URL and LLM_API_KEY
npm install
```

## Usage

```bash
# Start the chatbot (interactive terminal)
npm run agent

# Run the MCP server (stdio transport)
npm run mcp

# Run unit tests (mocked — no backend required)
npm test
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_API_URL` | Yes | Base URL of the Tvarita backend API |
| `LLM_API_KEY` | Yes (for chatbot) | OpenRouter API key |
| `LLM_MODEL` | No | Model id. Default: `google/gemma-4-26b-a4b-it:free` (dev). Use `google/gemma-4-31b-it` for demo/production. |
| `BACKEND_TIMEOUT_MS` | No | Backend HTTP timeout in ms (default: `15000`) |
| `OPENROUTER_TIMEOUT_MS` | No | OpenRouter timeout in ms (default: `60000`) |
| `MCP_SERVER_PORT` | No | Reserved for future HTTP transport (default: `3001`) |

## V1 Endpoints Covered

| Tool | Method | Endpoint |
|------|--------|----------|
| `get_states` | GET | `/api/states` |
| `get_events_by_state` | GET | `/api/states/{state_id}/events` |
| `get_event_detail` | GET | `/api/events/{event_id}` |
| `get_event_artists` | GET | `/api/events/{event_id}/artists` |
| `get_artist_timeslots` | GET | `/api/artists/{artist_id}/timeslots` |
| `request_otp` | POST | `/api/auth/guest/otp/request` |
| `verify_otp` | POST | `/api/auth/guest/otp/verify` |
| `create_individual_booking` | POST | `/api/bookings/individual` |
| `create_school_booking` | POST | `/api/bookings/school` |
| `create_corporate_booking` | POST | `/api/bookings/corporate` |
| `get_booking_status` | GET | `/api/bookings/{booking_id}/status` |
| `create_payment` | POST | `/api/payments/create` |
| `get_payment_status` | GET | `/api/payments/{payment_id}/status` |
| `submit_feedback` | POST | `/api/feedback` |
| `get_artist_feedback` | GET | `/api/artists/{artist_id}/feedback` |

## Project Structure

```
ai-module/
├── AUTH_REQUIREMENTS.md    # per-tool ANONYMOUS vs REQUIRES_SESSION
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── config.js           # env loader + validation
│   ├── api-client.js        # thin HTTP client (built-in fetch)
│   ├── session-store.js     # conversation-scoped auth token store
│   ├── tools/
│   │   ├── discovery.js     # public discovery tools
│   │   ├── auth.js          # guest OTP auth tools
│   │   ├── booking.js       # individual, school, corporate booking tools
│   │   ├── payments.js      # payment create + status tools
│   │   └── feedback.js      # feedback submit + public list
│   ├── mcp-server.js        # MCP server (registers all tools)
│   ├── agent.js             # conversational agent loop
│   ├── logger.js            # stderr logging with secret redaction
│   └── mcp-result.js        # MCP success/error helpers
└── tests/
    ├── api-client.test.js   # HTTP client tests (mocked fetch)
    ├── discovery.test.js    # discovery tools tests
    ├── auth.test.js         # auth tools tests
    ├── booking.test.js      # booking tool tests
    ├── payments.test.js     # payment tool tests
    └── feedback.test.js     # feedback tool tests
```
