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
2. Configure environment variables in `.env`:
   ```bash
   # Helius API for real Solana blockchain data
   VITE_HELIUS_API_KEY=your-helius-api-key
   VITE_HELIUS_API_BASE=https://api.helius.xyz
   VITE_USE_HELIUS=true  # Set to 'true' to use real blockchain data
   
   # Optional: Configure polling intervals
   VITE_HELIUS_POLL_MS=8000
   VITE_HELIUS_TX_LIMIT=25
   ```
3. Install deps and run:
   ```powershell
   npm install
   npm run dev
   ```
   The app serves at http://localhost:5173 by default.

### Data Modes
- **Mock Mode** (default): Simulates pump.fun trades with fake data for testing
- **Helius Mode** (set `VITE_USE_HELIUS=true`): Tracks real KOL wallets on Solana blockchain and detects actual pump.fun token buys

The system only tracks BUY transactions for pump.fun tokens (identified by metadata URI containing pump.fun or cf-ipfs.com indicators).

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