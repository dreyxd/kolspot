# KOLSpot — KOLs Tournament (Frontend)

Dark, minimalist UI for tracking Key Opinion Leaders (KOLs) trades and live PNL on Solana.

## Features
- Dark theme with orange accents (TailwindCSS)
- Homepage with hero + CTA
- Live Leaderboard with sorting and filters
- KOL Profile page with PNL chart (Chart.js) and trade history
- Real-time updates via WebSocket or SSE (mock fallback for local dev)
- Responsive, minimal animations

## Tech
- Vite + React + TypeScript
- TailwindCSS
- Chart.js via `react-chartjs-2`
- React Router

## Setup
1. Install Node.js 18+ and PNPM/NPM.
2. Copy env and set real-time URL (optional):
   ```powershell
   Copy-Item .env.example .env
   # Set one of these to your backend stream endpoint
   # $env:VITE_WS_URL = "wss://your-backend/ws"
   # $env:VITE_SSE_URL = "https://your-backend/sse"
   ```
3. Install deps and run:
   ```powershell
   npm install
   npm run dev
   ```
   The app serves at http://localhost:5173 by default.

If no `VITE_WS_URL` or `VITE_SSE_URL` is set, the app runs with a local mock that simulates trades, PNL series, and leaderboard updates every ~2s.

## Scripts
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Project Structure
- `src/pages/Home.tsx` — Hero and basic sections
- `src/pages/Leaderboard.tsx` — Live leaderboard
- `src/pages/KolProfile.tsx` — PNL chart + trade history
- `src/services/realtime.ts` — WS/SSE client + mock generator
- `src/index.css` — Tailwind base + theme utilities

## Styling
- Dark base (`bg-background`), surfaces (`bg-surface`), accent (`accent`) from Tailwind theme
- Subtle hovers only; no heavy animations

## Notes
- Backend is responsible for broadcasting trade, leaderboard, and pnl events with payloads matching `src/types.ts` shapes. The realtime client expects `{ type, data }` messages.