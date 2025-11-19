# Railway Deployment - Add Moralis API Key

## Steps to Complete Moralis Integration

### 1. Add Environment Variable to Railway

1. Go to [Railway Dashboard](https://railway.app/)
2. Select your `kolspot-production` project
3. Click on your backend service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add:
   ```
   Variable Name: MORALIS_API_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImIyMDg0YmU2LWZlMDgtNGY5OC1hY2RmLTYzMGRlNTE2MDQzMSIsIm9yZ0lkIjoiNDc2MzYyIiwidXNlcklkIjoiNDkwMDg1IiwidHlwZUlkIjoiZGFmYWMxYTQtNDUxNC00OGFlLWJkZmMtNDRmYzk4YjRmMDYxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjM1Mjc4NTIsImV4cCI6NDkxOTI4Nzg1Mn0.huljaDCA8ZvCxICibjY_zA2zee01qQLBGB3xgn48UQ8
   ```
7. Click **Add**

### 2. Verify Deployment

Railway will automatically redeploy with the new environment variable.

### 3. Check Logs

After deployment, check Railway logs for:
```
✓ Moralis initialized successfully
```

### 4. Monitor Enrichment

Watch for enrichment logs:
```
[Pump.fun] Enriching metadata for X tokens...
[Jupiter] Enriching metadata for X tokens...
[DexScreener] Enriching metadata for X tokens...
[Moralis] Enriching metadata for X tokens...
[Moralis] Enriched Y/X trades
```

### 5. Verify on KOLBoard

1. Visit your KOLBoard
2. Check that tokens show:
   - ✅ Token name (not UNKNOWN)
   - ✅ Token symbol
   - ✅ Token logo/image
   - ✅ Price (if available)
   - ✅ Market cap (if available)

## Expected Behavior

### Enrichment Chain
```
NEW TOKEN DETECTED
    ↓
Pump.fun API (pump tokens)
    ↓ (if UNKNOWN)
Jupiter API (established tokens)
    ↓ (if UNKNOWN)
DexScreener API (DEX pairs)
    ↓ (if UNKNOWN)
Moralis API (comprehensive fallback)
    ↓
ENRICHED TOKEN DATA
```

### Success Metrics
- **Coverage**: 95%+ tokens enriched (not UNKNOWN)
- **Performance**: <500ms enrichment time
- **Cost**: $0/month (all free APIs + Moralis Starter)
- **CU Usage**: <66k/day (well within 2M/month limit)

## Troubleshooting

### If Moralis doesn't initialize
1. Check Railway environment variables
2. Verify API key is correct
3. Check Moralis dashboard for key status
4. Review Railway deployment logs

### If tokens still show UNKNOWN
1. Check all 4 enrichment tiers are running
2. Verify token exists on Solana mainnet
3. Check if token is very new (may not be indexed yet)
4. Review backend logs for specific errors

### High CU usage
1. Verify caching is working (should see cache hits in logs)
2. Check enrichment order (Moralis should be last)
3. Monitor Moralis dashboard usage metrics

## Monitoring

### Moralis Dashboard
- URL: https://admin.moralis.io/
- Check: Usage & Billing → Compute Units
- Alert if: >1.5M CU used in a month

### Railway Logs
- Watch for initialization success
- Monitor enrichment logs
- Check for error patterns

## Next Steps

After deployment:
1. ✅ Verify Moralis initializes
2. ✅ Check token enrichment working
3. ✅ Monitor CU usage first 24 hours
4. ✅ Confirm KOLBoard displays rich data
5. ✅ Set up alerts for high CU usage

## Support

If you encounter issues:
1. Check Railway logs
2. Review Moralis dashboard
3. Verify environment variable is set
4. Test locally with same API key
