# FanFlow AI — Smart Fan Companion for FIFA World Cup 2026

**Hack2Skill Challenge 4 — Smart Stadiums & Tournament Operations**

FanFlow AI is a GenAI-powered on-site assistant for **fans** attending FIFA World Cup 2026 matches. Instead of a stack of disconnected features, it's a single conversational assistant with five lightweight, tightly-integrated capabilities — designed to feel like one coherent product, not a checklist.

## Chosen Vertical: Fans

The challenge asks solutions to be designed around one persona: fans, organizers, volunteers, or venue staff. FanFlow AI is built for **fans on match day** — the people who most need fast, human, in-the-moment help navigating an unfamiliar stadium in a language that may not be the venue's default.

## Why "Fans" and How This Maps to the Full Challenge Brief

The challenge — **Smart Stadiums & Tournament Operations** — explicitly allows a solution to be designed around **one** persona: fans, organizers, volunteers, or venue staff. FanFlow AI deliberately targets **fans on match day**, because they are the largest audience, have the least institutional support on-site, and benefit most immediately from real-time, multilingual, on-site guidance.

This is a **scoping decision, not a gap**. Within the fan-facing scope, FanFlow AI covers every theme named in the brief:

| Challenge Theme | Covered? | Where |
|---|---|---|
| Navigation | ✅ | Seat section → gate, walk time, amenities |
| Crowd management / real-time decision support | ✅ | Live gate-status ticker + proactive lower-traffic gate suggestions |
| Accessibility | ✅ | Dedicated high-contrast mode; AI biases toward wheelchair-accessible routes |
| Transportation | ✅ | Nearest metro/bus/parking, walk distance |
| Sustainability | ✅ | Refill stations, low-emission transport nudges |
| Multilingual assistance | ✅ | Native LLM language detection and reply |
| Operational intelligence | ✅ | Simulated live crowd data drives assistant responses |

**Explicitly out of scope:** organizer/volunteer-facing tools (match scheduling, staffing, venue-ops dashboards) — this is the other half of the challenge title, and would belong to an "Organizer" or "Venue Staff" persona submission. We chose depth on one persona over shallow coverage of all four, per the challenge's own instruction to "choose one of the provided challenge verticals."

## Capabilities (mapped to the problem statement)

| Capability | What it does | Problem statement theme |
|---|---|---|
| **Navigation** | Given a seat section, tells the fan which gate to use, walk time, and nearby amenities | Navigation |
| **Live Crowd Advisory** | Simulated live gate-traffic feed; the assistant proactively suggests a lower-traffic gate when relevant | Crowd management, real-time decision support |
| **Multilingual Chat** | No separate translation layer — the assistant detects the fan's language and replies fluently in it | Multilingual assistance |
| **Accessibility Mode** | One toggle switches to high-contrast, larger-text UI and biases answers toward wheelchair-accessible routes/amenities | Accessibility |
| **Transport & Sustainability tips** | Nearby metro/bus/parking, and eco-friendly nudges (refill stations, lower-emission transport) surfaced naturally in conversation | Transportation, sustainability |

## Architecture

```
Browser (React/Next.js UI)
   │
   │  POST /api/assistant  { message, seatSection, accessibilityMode }
   ▼
Next.js API Route
   │  1. rate-limit check (per-IP, in-memory)
   │  2. validate & sanitize input
   │  3. read simulated live crowd levels
   │  4. build a context-rich prompt (venue facts + live crowd + user message)
   ▼
Gemini API (gemini-2.5-flash)
   │  reasons over the given facts only; detects & replies in user's language
   ▼
Response → UI renders reply + crowd advisory badge
```

A separate lightweight `GET /api/crowd-snapshot` endpoint powers the live gate-status ticker in the header, polled every 15s, kept independent from the (rate-limited, LLM-backed) chat endpoint so browsing the ticker never eats into a fan's chat quota.

**Design principle:** the model never invents venue facts. All stadium knowledge (`data/stadium.json`) is deterministic, and the model's job is purely to turn that data into a natural, contextual, multilingual reply.

## Key Assumptions

- **Real FIFA venue data and live IoT crowd sensors are not publicly available**, so this submission uses a realistic, clearly-labeled **simulated dataset** (`data/stadium.json`) and a deterministic crowd-level simulator (`utils/crowdSimulator.ts`). In a production deployment, these would be replaced by integrations with the venue's real gate/seating system and live crowd-sensor feeds — the prompt-building and decision-support logic would not need to change.
- Gemini's native multilingual ability is relied on directly (via system-prompt instruction) rather than a separate translation API, keeping the system simpler and faster.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Backend:** Next.js API routes (same repo, single deploy)
- **AI:** Google Gemini API (`gemini-2.5-flash`, free tier)
- **Testing:** Jest + React Testing Library (24 tests covering prompt building, validation, crowd simulation, and component rendering)

## Project Structure

```
app/
  page.tsx                    Main UI
  api/assistant/route.ts      Chat endpoint (validation → prompt → Gemini → response)
  api/crowd-snapshot/route.ts Live crowd ticker feed
components/                   ChatWindow, MessageBubble, AccessibilityToggle, SeatInput, StadiumTicker
services/                     geminiClient.ts (API wrapper), promptBuilder.ts (context builder)
utils/                        validation.ts, rateLimiter.ts, crowdSimulator.ts
data/stadium.json             Simulated venue dataset (gates, sections, amenities, transport, sustainability tips)
types/index.ts                Shared TypeScript types
```

## Setup

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and set GEMINI_API_KEY (free key: https://aistudio.google.com/apikey)
npm run dev
```

Open http://localhost:3000.

Run tests: `npm test` · Lint: `npm run lint` · Production build: `npm run build`

## Security & Quality Notes

- API key is server-side only, never exposed to the client
- All user input validated & sanitized before use (`utils/validation.ts`)
- Per-client rate limiting on the chat endpoint
- Every Gemini call has a timeout + single retry + fail-closed error handling
- Full keyboard navigation, ARIA labels, visible focus rings, and a dedicated high-contrast accessibility mode
- `prefers-reduced-motion` respected throughout

## Future Scope

- Real venue/ticketing system integration in place of the simulated dataset
- Live IoT crowd sensors instead of the simulated feed
- Push notifications for proactive gate-change alerts
