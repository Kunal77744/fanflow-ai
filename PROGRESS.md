# FanFlow AI — Progress Tracker

> **Agar conversation kabhi ruk jaaye (credit limit, disconnect, etc.), yeh file dikha ke bolo:
> "Yahan se continue karo" — sab context yahin mil jayega.**

## Project Summary
- **Challenge:** Hack2Skill Challenge 4 — Smart Stadiums & Tournament Operations
- **Persona chosen:** Fan (navigation, crowd advisory, multilingual, accessibility, transport, sustainability)
- **Stack:** Next.js + TypeScript + Tailwind + Framer Motion + Gemini API
- **Goal:** Score 99-100, Rank 1

## Status Legend
- [x] Done
- [~] In progress
- [ ] Not started

## Build Checklist

### 1. Setup
- [x] Folder structure created
- [ ] package.json + dependencies
- [ ] tsconfig.json
- [ ] tailwind config
- [ ] .gitignore
- [ ] .env.local.example

### 2. Types (src/types/index.ts)
- [ ] Section, Gate, Amenity, TransportOption, SustainabilityTip interfaces
- [ ] ChatRequest, ChatResponse interfaces

### 3. Mock Data (src/data/)
- [ ] stadium.json (gates, sections, amenities)
- [ ] crowd.json (initial crowd levels)
- [ ] transport.json (metro/bus/parking)
- [ ] sustainability.json (refill stations, eco tips)

### 4. Services (src/services/)
- [ ] geminiClient.ts — Gemini API wrapper (server-side only)
- [ ] promptBuilder.ts — builds context-rich system prompt

### 5. Utils (src/utils/)
- [ ] validation.ts — input sanitization
- [ ] crowdSimulator.ts — rotates mock crowd levels

### 6. Backend API (src/app/api/assistant/route.ts)
- [ ] POST handler: validate input → build prompt → call Gemini → return response
- [ ] Error handling (try/catch/timeout)
- [ ] Basic rate limiting

### 7. Frontend Components (src/components/)
- [ ] ChatWindow.tsx
- [ ] MessageBubble.tsx
- [ ] AccessibilityToggle.tsx
- [ ] LanguageIndicator.tsx
- [ ] CrowdStatusBadge.tsx

### 8. Main Page (src/app/page.tsx)
- [ ] Hero/intro section
- [ ] Chat interface wired to /api/assistant
- [ ] Accessibility mode toggle wired up

### 9. Design Pass
- [ ] Design token system (colors, type, layout) — distinctive, not generic
- [ ] Apply Tailwind + Framer Motion per design plan

### 10. Tests (src/tests/)
- [ ] promptBuilder.test.ts
- [ ] validation.test.ts
- [ ] crowdSimulator.test.ts
- [ ] Basic component render test

### 11. Docs & Deploy
- [ ] README.md (vertical, architecture, assumptions, setup, screenshots)
- [ ] Deploy to Vercel
- [ ] Final polish pass (accessibility contrast check, responsive check)

## Notes / Decisions Made
- Using mock JSON data (disclosed transparently in README) since real FIFA stadium data isn't available
- Multilingual handled via Gemini's native capability + system prompt instruction (no separate translation layer)
- Transport & Sustainability are lightweight — static data + AI mentions naturally, not separate heavy features
- TypeScript chosen for code quality score
- Repo must stay under 10MB — SVG icons only, no heavy assets, node_modules gitignored

## Next Step (pick up here)
→ Design token/plan for the UI (frontend-design pass), then package.json + config files
