# KOLSpot — Real-time KOL Tournament

Real-time Solana KOL (Key Opinion Leader) tracking platform with WebSocket streaming, PostgreSQL storage, and pump.fun token detection.

**🚀 Live Demo:** [kolspot.vercel.app](https://kolspot.vercel.app)  
**📊 Track:** 117+ KOL wallets | **⚡ Real-time:** WebSocket streaming | **🎯 Focus:** Pump.fun tokens

## Features

### Frontend
- 🎨 Dark minimalist UI with orange accents
- 📊 Real-time leaderboard with rankings and filters
- 👤 Individual KOL profiles with PNL charts and trade history
- 📈 Live trade feed (KOL Board) with token categorization
- 🔄 WebSocket connection for instant updates
- 📱 Fully responsive design

### Backend
- ⚡ WebSocket streaming for real-time trade broadcasts
- 🗄️ PostgreSQL database with indexed transactions
- 🔍 Helius API integration for Solana blockchain data
- 🎯 Automatic pump.fun token detection via metadata
- 💾 60-second response caching for performance
- 🔐 Rate limiting and error handling

## Tech Stack

### Frontend
- Vite + React 18 + TypeScript
- TailwindCSS for styling
- React Router for navigation
- Chart.js for analytics visualization
- WebSocket client for real-time updates

### Backend
- Node.js + Express
- PostgreSQL for data persistence
- WebSocket (ws) for real-time streaming
- Helius API for Solana blockchain data
- NodeCache for response caching

## Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Helius API key and database URL

# Run database migration
npm run migrate

# Start backend server
npm run dev
```

Backend runs on `http://localhost:3001`

## Environment Variables

### Frontend (.env)
```env
# Backend API Configuration (Production Mode)
VITE_BACKEND_API_URL=http://localhost:3001
VITE_BACKEND_WS_URL=ws://localhost:3001/api/stream/kol-buys
VITE_USE_BACKEND=true

# Helius API (Legacy Direct Mode - Optional)
VITE_HELIUS_API_KEY=your-key-here
VITE_USE_HELIUS=false
```

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Helius API
HELIUS_API_KEY=your-helius-api-key
HELIUS_BASE_URL=https://api.helius.xyz

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kolspot

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Project Structure

```
KOLSpot/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Home, Leaderboard, KOLBoard, KolProfile, HowItWorks
│   │   ├── components/      # Navbar, Footer
│   │   ├── services/        # API clients and WebSocket connections
│   │   │   ├── backendApi.ts      # REST API client
│   │   │   ├── backendWs.ts       # WebSocket client
│   │   │   ├── realtime.ts        # Mock/Helius direct mode
│   │   │   ├── helius.ts          # Helius integration
│   │   │   ├── kols.ts            # KOL data loader
│   │   │   └── tradeStore.ts      # Persistent trade storage
│   │   ├── utils/           # Formatting helpers
│   │   └── assets/          # Images, logo
│   ├── data/
│   │   └── kols.json        # 117+ KOL wallet addresses with metadata
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/          # REST API endpoints
    │   │   ├── kol.js       # POST /api/kol/transactions
    │   │   └── coins.js     # GET /api/coins/*
    │   ├── services/
    │   │   └── helius.js    # Helius blockchain integration
    │   ├── db/
    │   │   ├── connection.js    # PostgreSQL pool
    │   │   ├── queries.js       # Database queries
    │   │   └── migrate.js       # Schema migration
    │   ├── websocket/
    │   │   └── index.js     # WebSocket server
    │   ├── utils/
    │   │   └── cache.js     # Response caching
    │   └── index.js         # Express app entry point
    └── package.json
```

## Data Modes

KOLSpot supports three data modes:

1. **Backend Mode** (Recommended for Production)
   - Set `VITE_USE_BACKEND=true`
   - Connects to Node.js backend via REST + WebSocket
   - Real blockchain data with PostgreSQL persistence
   - Best performance and reliability

2. **Helius Direct Mode** (Legacy)
   - Set `VITE_USE_HELIUS=true`
   - Frontend polls Helius API directly
   - No backend required but higher rate limit usage

3. **Mock Mode** (Development/Testing)
   - Default when both flags are false
   - Generates realistic fake data
   - Perfect for UI development

## API Endpoints

### Backend REST API

**POST /api/kol/transactions**
Fetch and store KOL transactions
```json
{
  "walletAddress": "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o",
  "tokenFilter": ["BONK", "WIF"]
}
```

**GET /api/coins/kols-count?hours=24**
Get tokens grouped by distinct KOL buyer count

**GET /api/coins/recent-trades?limit=100**
Get recent buy transactions

**WebSocket: ws://localhost:3001/api/stream/kol-buys**
Real-time trade streaming

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables:
   ```
   VITE_USE_BACKEND=true
   VITE_BACKEND_API_URL=https://your-backend-url.com
   VITE_BACKEND_WS_URL=wss://your-backend-url.com/api/stream/kol-buys
   ```
4. Deploy (auto-deploys on push)

### Backend (Railway/Render/Heroku)

1. Create PostgreSQL database instance
2. Deploy backend service
3. Set environment variables (see backend/.env.example)
4. Run migration: `npm run migrate`
5. Update frontend environment with backend URL

**Detailed backend deployment guide:** [backend/README.md](./backend/README.md)

## Features Deep Dive

### Real-time Tracking
- WebSocket connection streams new trades instantly
- Automatic reconnection with exponential backoff
- Subscriber pattern for multiple UI components

### Pump.fun Detection
- Analyzes token metadata URI for pump.fun indicators
- Cross-references with DexScreener API
- Filters transactions above 1 SOL threshold

### Performance Optimization
- 60-second API response caching
- Database indexes on wallet, token, timestamp
- Efficient WebSocket broadcasting to 1000+ clients

### Data Persistence
- PostgreSQL with ACID transactions
- Duplicate prevention via signature uniqueness
- Historical data for trend analysis

## Development Scripts

### Frontend
```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend
```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Production start
npm run migrate   # Run database migrations
```

## KOL Data

The platform tracks 117+ prominent Solana KOLs including:
- Wallet addresses
- Twitter handles
- Trading history
- PNL calculations
- Token preferences

KOL data is stored in `data/kols.json` and can be updated to track additional wallets.

## Troubleshooting

**WebSocket not connecting:**
- Check CORS_ORIGIN in backend .env
- Verify WebSocket URL uses `ws://` (dev) or `wss://` (production)
- Check firewall settings

**No data showing:**
- Verify backend is running on correct port
- Check Helius API key is valid
- Ensure PostgreSQL database is accessible
- Run `npm run migrate` to create tables

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all environment variables are set

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Links

- **Live Demo:** https://kolspot.vercel.app
- **GitHub:** https://github.com/dreyxd/kolspot
- **Twitter:** [@KOLSpot](https://twitter.com/KOLSpot)

---

Built with ❤️ on Solana
