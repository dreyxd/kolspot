# KOLSpot Backend Service

Backend service for tracking Solana KOL (Key Opinion Leader) transactions using the Helius API.

## Features

- Real-time transaction tracking via WebSocket
- PostgreSQL database for persistent storage
- REST API endpoints for transaction queries
- Pump.fun token filtering
- Response caching for performance
- Rate limiting and error handling

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Helius API key ([Get one here](https://helius.xyz))

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database:
```bash
# Create database
createdb kolspot

# Run migrations
npm run migrate
```

## Environment Variables

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

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### POST /api/kol/transactions
Fetch and store KOL transactions for a wallet.

**Request Body:**
```json
{
  "walletAddress": "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o",
  "tokenFilter": ["BONK", "WIF"]  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "processed": 15,
  "saved": 12,
  "transactions": [...]
}
```

### GET /api/coins/kols-count
Get tokens grouped by distinct KOL buyer count.

**Query Parameters:**
- `hours` (optional): Time window in hours (default: 24)

**Response:**
```json
[
  {
    "tokenMint": "7HkZy8Aq7uN7zQadpMf8k9mvxXYXpump",
    "tokenSymbol": "BONK",
    "distinctKolsCount": 5,
    "mostRecentBuyTimestamp": "2025-11-18T10:30:00Z",
    "totalVolume": 150000.50
  }
]
```

### GET /api/coins/recent-trades
Get recent buy transactions.

**Query Parameters:**
- `limit` (optional): Number of transactions (default: 100)

**Response:**
```json
[
  {
    "walletAddress": "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o",
    "tokenMint": "7HkZy8Aq7uN7zQadpMf8k9mvxXYXpump",
    "tokenSymbol": "BONK",
    "amount": 10000,
    "timestamp": "2025-11-18T10:30:00Z",
    "signature": "5Jx..."
  }
]
```

### WebSocket: /api/stream/kol-buys
Real-time stream of new KOL buy transactions.

**Connect:**
```javascript
const ws = new WebSocket('ws://localhost:3001/api/stream/kol-buys');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New transaction:', data);
};
```

**Message Format:**
```json
{
  "type": "trade",
  "data": {
    "walletAddress": "...",
    "tokenSymbol": "BONK",
    "tokenMint": "...",
    "amount": 10000,
    "timestamp": "2025-11-18T10:30:00Z",
    "signature": "..."
  }
}
```

## Database Schema

### kol_transactions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| wallet_address | VARCHAR(44) | Solana wallet address |
| token_mint | VARCHAR(44) | Token mint address |
| token_symbol | VARCHAR(20) | Token symbol |
| amount | DECIMAL(24,8) | Token amount |
| timestamp | TIMESTAMPTZ | Transaction timestamp |
| signature | VARCHAR(88) | Unique transaction signature |
| created_at | TIMESTAMPTZ | Record creation time |

## Deployment

### Vercel/Railway/Heroku

1. Set environment variables in platform dashboard
2. Configure PostgreSQL database (use managed service recommended)
3. Run migrations: `npm run migrate`
4. Deploy: Platform will auto-detect Node.js app

### Docker (Optional)

```bash
docker build -t kolspot-backend .
docker run -p 3001:3001 --env-file .env kolspot-backend
```

## Performance Considerations

- **Caching**: API responses cached for 60 seconds
- **Rate Limiting**: Helius API has rate limits - be mindful of request frequency
- **Database Indexing**: Indexes on wallet_address, token_mint, timestamp
- **WebSocket**: Scales to 1000+ concurrent connections

## Troubleshooting

**Database connection failed:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**Helius API errors:**
- Verify API key is correct
- Check rate limits
- Ensure wallet addresses are valid

**WebSocket not connecting:**
- Check CORS_ORIGIN setting
- Verify WebSocket path: `/api/stream/kol-buys`
- Check firewall settings

## License

MIT
