# Moralis API Integration

## Overview
KOLSpot backend uses **Moralis Token API** and **Price API** to fetch comprehensive token metadata and real-time price data for Solana SPL tokens.

## Features
- ✅ **Token Metadata**: Name, symbol, logo, decimals
- ✅ **Real-time Prices**: USD prices from Moralis
- ✅ **15-minute caching**: Optimized to stay within 2M CU/month limit
- ✅ **Automatic fallback**: Part of 4-tier enrichment system

## API Usage

### Moralis Starter Plan
- **Compute Units**: 2M CU/month
- **Estimated Daily Usage**: ~66,000 CU/day
- **Rate Limit Strategy**: 100ms delay between requests
- **Cache Duration**: 15 minutes for both metadata and prices

## Enrichment Priority Chain

```
1. Pump.fun API (Primary - free, unlimited)
   ↓ (for pump.fun tokens)
   
2. Jupiter API (Secondary - free, generous limits)
   ↓ (for established Solana tokens)
   
3. DexScreener API (Tertiary - free)
   ↓ (for DEX pairs)
   
4. Moralis API (Final fallback - 2M CU/month)
   ↓ (comprehensive Solana coverage)
   
✓ Rich token data displayed on KOLBoard
```

## Implementation

### Service File
`backend/src/services/moralis.js`

### Key Functions

#### `fetchTokenMetadata(mintAddress)`
Fetches token metadata (name, symbol, logo, decimals)
```javascript
const metadata = await fetchTokenMetadata('TokenMintAddress...');
// Returns: { name, symbol, logo, decimals }
```

#### `fetchTokenPrice(mintAddress)`
Fetches current USD price
```javascript
const price = await fetchTokenPrice('TokenMintAddress...');
// Returns: 0.00123 (USD)
```

#### `enrichTokenMetadata(trades)`
Enriches trade data with Moralis metadata
```javascript
const enrichedTrades = await enrichTokenMetadata(trades);
```

## Caching Strategy

### Memory Cache
- **TTL**: 15 minutes (900,000ms)
- **Cleanup**: Every 5 minutes
- **Keys**: 
  - `metadata-{mintAddress}`
  - `price-{mintAddress}`

### Benefits
- Reduces API calls by ~95%
- Improves response time
- Stays within compute unit limits
- Handles duplicate token requests efficiently

## Environment Variables

### Required
```env
MORALIS_API_KEY=your_moralis_api_key_here
```

### Setup
1. Get API key from [Moralis Dashboard](https://admin.moralis.io/)
2. Add to Railway environment variables
3. Service auto-initializes on first request

## Monitoring Usage

### Check Compute Units
1. Visit [Moralis Dashboard](https://admin.moralis.io/)
2. Navigate to "Usage & Billing"
3. Monitor daily CU consumption

### Expected Usage Pattern
- **Per token lookup**: ~100-200 CU
- **With caching**: ~20 CU per token (15min window)
- **Daily estimate**: ~10,000-30,000 CU (depending on traffic)

## Error Handling

### Initialization Errors
- Service logs initialization status
- Falls back gracefully if API key missing
- Continues to next enrichment tier

### API Errors
- Cached failures don't prevent retries
- Rate limit detection
- Automatic fallback to next tier

## Testing

### Local Development
1. Add `MORALIS_API_KEY` to local `.env`
2. Start backend: `npm start`
3. Watch console for `✓ Moralis initialized successfully`
4. Monitor enrichment logs: `[Moralis] Enriching metadata for X tokens...`

### Production (Railway)
1. Add `MORALIS_API_KEY` to Railway environment variables
2. Deploy
3. Monitor logs for Moralis activity
4. Check dashboard for CU usage

## Best Practices

### Optimize CU Usage
✅ Cache aggressively (15 minutes)
✅ Use as final fallback (after free APIs)
✅ Batch similar requests
✅ Monitor daily usage trends

### Avoid CU Waste
❌ Don't disable caching
❌ Don't use for high-frequency polling
❌ Don't ignore rate limits
❌ Don't fetch same token repeatedly

## Troubleshooting

### "Not initialized" warnings
- Check `MORALIS_API_KEY` environment variable
- Verify API key is valid in Moralis dashboard
- Check Railway deployment logs

### High CU consumption
- Verify cache is working (15min TTL)
- Check for duplicate requests
- Review enrichment order (Moralis should be last)

### No enrichment happening
- Check if previous tiers (Pump.fun, Jupiter) are catching tokens
- Verify Moralis is only used for UNKNOWN tokens
- Check console logs for error messages

## Cost Analysis

### Free Alternative Stack
| Service | Cost | Coverage |
|---------|------|----------|
| Pump.fun | FREE | Pump tokens |
| Jupiter | FREE | 15K+ tokens |
| DexScreener | FREE | DEX pairs |
| **Moralis** | **FREE** (2M CU) | All Solana |

### Moralis as Safety Net
- Catches tokens missed by free APIs
- Provides comprehensive Solana coverage
- 2M CU/month = ~20,000 token lookups with caching
- **$0/month** on Starter plan

## Future Improvements

### Potential Optimizations
- [ ] Implement Redis for distributed caching
- [ ] Add CU usage tracking and alerts
- [ ] Create cache warming for popular tokens
- [ ] Implement smart retry logic
- [ ] Add metrics dashboard for enrichment success rates

## Support

For issues or questions about Moralis integration:
1. Check Moralis documentation: https://docs.moralis.io/
2. Review backend logs in Railway
3. Monitor CU usage in Moralis dashboard
