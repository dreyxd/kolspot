# 1 SOL Challenge Feature

A trading competition feature for KOLSpot where users compete for SOL rewards based on their trading performance.

## Features

- **Competition Management**: Create and manage trading competitions with configurable prize pools
- **Wallet Registration**: Users can register their Solana wallets to participate
- **Live Leaderboard**: Real-time performance tracking and rankings
- **Top 5 Winners**: Display winners in both the challenge page and KOL Terminal
- **Prize Pool**: Funded by creator-fee rewards (configurable amounts)

## Database Setup

Run the migration script to create the necessary tables:

```bash
cd backend
psql -U your_username -d your_database -f src/db/schema-competition.sql
```

This creates:
- `competitions` table: Stores competition details
- `competition_entries` table: Stores participant entries and performance

## API Endpoints

### Public Endpoints

- `GET /api/competition/active` - Get currently active competition
- `GET /api/competition/latest-finished` - Get latest finished competition with winners
- `GET /api/competition/:id` - Get competition details
- `GET /api/competition/:id/leaderboard` - Get competition leaderboard (live updates)
- `POST /api/competition/register` - Register wallet for competition
- `GET /api/competition/:id/entry/:walletAddress` - Check registration status

### Admin Endpoints

- `GET /api/competition/admin/all` - Get all competitions
- `POST /api/competition/admin/create` - Create new competition
- `PATCH /api/competition/admin/:id/status` - Update competition status
- `POST /api/competition/:id/finalize` - Finalize competition and determine winners

## Creating a Competition (Admin)

Use the admin endpoint to create a new competition:

```bash
POST /api/competition/admin/create
Content-Type: application/json

{
  "name": "1 SOL Challenge – Week 01",
  "status": "upcoming",
  "startTime": "2025-11-25T00:00:00Z",
  "endTime": "2025-12-01T23:59:59Z",
  "totalPrizePoolSol": 1.0
}
```

## Competition Lifecycle

1. **Create** competition with status `upcoming`
2. **Update** status to `active` when ready to start
3. Users **register** their wallets during active period
4. Performance is tracked automatically (currently using mock data)
5. **Finalize** competition to calculate final rankings and mark winners
6. Winners displayed in leaderboard and KOL Terminal

## Frontend Components

### SolChallengeSection
Main competition page section showing:
- Competition details (name, status, prize pool, dates)
- Registration button
- Live leaderboard table
- Performance percentages

Located in: `src/components/SolChallengeSection.tsx`

### SolChallengeWinners
Top 5 winners widget for KOL Terminal:
- Shows latest finished competition winners
- Displays ranks, wallets, and performance
- Winner badges and titles

Located in: `src/components/SolChallengeWinners.tsx`

## Integration Points

### Wallet Performance Tracking

Currently uses mock data in `backend/src/services/walletPerformance.js`. 

To integrate real data, update these functions:
- `getWalletValueAtTime(walletAddress, timestamp)` - Get historical wallet value
- `getCurrentWalletValue(walletAddress)` - Get current wallet value

Use existing Helius/Moralis integration for accurate portfolio tracking.

### Wallet Connection

Frontend currently uses a mock wallet. To integrate real Solana wallet:

```tsx
import { useWallet } from '@solana/wallet-adapter-react';

// Replace mock useWallet() in SolChallengeSection.tsx
const { connected, publicKey, connect } = useWallet();
```

## Environment Variables

No additional environment variables needed. Uses existing:
- `VITE_BACKEND_API_URL` - Backend API base URL

## Testing

1. Create a test competition:
```bash
curl -X POST http://localhost:3001/api/competition/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Challenge",
    "status": "active",
    "startTime": "2025-11-20T00:00:00Z",
    "endTime": "2025-11-27T23:59:59Z",
    "totalPrizePoolSol": 1.0
  }'
```

2. Visit the home page to see the challenge section
3. Click "Register" (uses mock wallet for testing)
4. View the leaderboard in real-time
5. Check KOL Terminal for winners widget

## Future Enhancements

- [ ] Real Solana wallet integration
- [ ] Actual portfolio value tracking via Helius/Moralis
- [ ] Automatic competition status transitions based on time
- [ ] On-chain prize distribution
- [ ] Email notifications for winners
- [ ] Competition history page
- [ ] Performance charts and analytics
- [ ] Multiple concurrent competitions
- [ ] Entry fees and larger prize pools

## Files Created/Modified

### Backend
- `backend/src/db/schema-competition.sql` - Database schema
- `backend/src/db/competitionQueries.js` - Database queries
- `backend/src/services/walletPerformance.js` - Performance tracking (mock)
- `backend/src/routes/competition.js` - API routes
- `backend/src/index.js` - Added competition routes

### Frontend
- `src/services/competitionApi.ts` - API client
- `src/components/SolChallengeSection.tsx` - Main challenge section
- `src/components/SolChallengeWinners.tsx` - Winners widget
- `src/pages/Home.tsx` - Added challenge section
- `src/pages/KOLTerminal.tsx` - Added winners widget

## Support

For questions or issues, please contact the development team.
