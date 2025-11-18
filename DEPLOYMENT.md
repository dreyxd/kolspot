# KOLSpot Deployment Checklist

Complete guide for deploying KOLSpot frontend and backend to production.

## Prerequisites

- [ ] GitHub account with repository access
- [ ] Vercel account (for frontend)
- [ ] Railway/Render/Heroku account (for backend)
- [ ] PostgreSQL database (managed service recommended)
- [ ] Helius API key ([Get one here](https://helius.xyz))

## Backend Deployment

### Step 1: Create PostgreSQL Database

**Railway:**
1. Create new project → Add PostgreSQL
2. Copy `DATABASE_URL` from Variables tab
3. Format: `postgresql://user:pass@host:port/dbname`

**Render:**
1. New → PostgreSQL
2. Copy External Database URL
3. Note: Use external URL for connections outside Render

### Step 2: Deploy Backend Service

**Railway:**
1. New Project → Deploy from GitHub
2. Select `dreyxd/kolspot` repository
3. Set Root Directory: `backend`
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   HELIUS_API_KEY=your-helius-api-key
   HELIUS_BASE_URL=https://api.helius.xyz
   DATABASE_URL=<your-postgres-url>
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
5. Deploy

**Render:**
1. New → Web Service
2. Connect GitHub repository
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables (same as above)
7. Deploy

### Step 3: Run Database Migration

**Railway:**
```bash
# Use Railway CLI
railway run npm run migrate

# Or connect via psql and run manually
psql <DATABASE_URL> < backend/src/db/migrate.sql
```

**Render:**
1. Connect to database via Shell tab
2. Run migration script:
```bash
npm run migrate
```

### Step 4: Get Backend URLs

After deployment, note these URLs:
- API URL: `https://your-backend.railway.app`
- WebSocket URL: `wss://your-backend.railway.app/api/stream/kol-buys`

Test health endpoint: `https://your-backend.railway.app/health`

## Frontend Deployment

### Step 1: Configure Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Select `dreyxd/kolspot`
4. Framework Preset: Vite
5. Root Directory: `.` (leave as project root)

### Step 2: Set Environment Variables

In Vercel Project Settings → Environment Variables:

```
VITE_USE_BACKEND=true
VITE_BACKEND_API_URL=https://your-backend.railway.app
VITE_BACKEND_WS_URL=wss://your-backend.railway.app/api/stream/kol-buys
```

Optional (for legacy Helius direct mode):
```
VITE_HELIUS_API_KEY=your-key
VITE_USE_HELIUS=false
```

### Step 3: Deploy

1. Click Deploy
2. Wait for build to complete
3. Visit deployment URL
4. Test WebSocket connection in browser console

### Step 4: Configure Custom Domain (Optional)

1. Vercel → Settings → Domains
2. Add domain: `kolspot.com`
3. Update DNS records as instructed
4. Update backend `CORS_ORIGIN` to match new domain

## Post-Deployment Verification

### Backend Health Checks

- [ ] Health endpoint returns 200: `curl https://backend-url/health`
- [ ] Database connection working (check logs)
- [ ] WebSocket accepts connections: `wscat -c wss://backend-url/api/stream/kol-buys`
- [ ] API endpoints return data: `curl https://backend-url/api/coins/recent-trades`

### Frontend Verification

- [ ] Homepage loads without errors
- [ ] Leaderboard displays data
- [ ] KOL Board shows live trades
- [ ] WebSocket connection established (check Network tab)
- [ ] No console errors
- [ ] All routes accessible (no 404s)

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] WebSocket latency < 500ms
- [ ] API response time < 1 second
- [ ] Lighthouse score > 90

## Monitoring & Maintenance

### Logs

**Railway:**
- View logs in project dashboard
- Use Railway CLI: `railway logs`

**Render:**
- Logs tab in web service dashboard
- Real-time streaming available

**Vercel:**
- Deployments → Select deployment → Function Logs
- Real-time logs in CLI: `vercel logs`

### Database Maintenance

```bash
# Connect to database
psql $DATABASE_URL

# Check table size
SELECT pg_size_pretty(pg_total_relation_size('kol_transactions'));

# View recent transactions
SELECT * FROM kol_transactions ORDER BY timestamp DESC LIMIT 10;

# Clean old data (optional - older than 30 days)
DELETE FROM kol_transactions WHERE timestamp < NOW() - INTERVAL '30 days';

# Vacuum and analyze
VACUUM ANALYZE kol_transactions;
```

### Scaling Considerations

**Backend:**
- Monitor CPU/memory usage
- Scale horizontally for WebSocket connections
- Consider Redis for caching if traffic increases
- Add rate limiting middleware

**Database:**
- Monitor connection pool usage
- Add read replicas for heavy queries
- Consider partitioning for large datasets
- Regular backups (most platforms do this automatically)

## Troubleshooting

### Backend Won't Start
1. Check environment variables are set correctly
2. Verify DATABASE_URL format
3. Ensure PostgreSQL is accessible
4. Check logs for specific errors

### Frontend Can't Connect to Backend
1. Verify CORS_ORIGIN in backend matches frontend URL
2. Check WebSocket URL uses `wss://` (not `ws://`)
3. Ensure backend is deployed and running
4. Test backend health endpoint directly

### Database Migration Failed
1. Check DATABASE_URL is correct
2. Ensure database exists
3. Verify network access to database
4. Run migration manually via psql

### WebSocket Disconnects Frequently
1. Check backend logs for errors
2. Verify WebSocket timeout settings
3. Ensure stable backend hosting
4. Implement reconnection logic (already included)

## Rollback Procedure

### Frontend Rollback (Vercel)
1. Deployments tab
2. Find previous successful deployment
3. Click three dots → Promote to Production

### Backend Rollback
**Railway:**
1. Deployments tab
2. Select previous deployment
3. Redeploy

**Render:**
1. Manual Deployment from specific commit
2. Or revert Git commit and push

### Database Rollback
```bash
# Backup before making changes
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Cost Estimates

### Free Tier (Hobby Projects)
- **Frontend (Vercel):** Free (100GB bandwidth)
- **Backend (Railway):** $5/month (after free trial)
- **Database (Railway):** Included in backend plan
- **Helius API:** Free tier (limited requests)
- **Total:** ~$5-10/month

### Production Scale
- **Vercel Pro:** $20/month (1TB bandwidth)
- **Railway Pro:** $20-50/month (depends on usage)
- **Managed PostgreSQL:** $15-30/month
- **Helius API:** $50-200/month (depends on volume)
- **Total:** ~$100-300/month

## Security Checklist

- [ ] All API keys stored in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] CORS properly configured
- [ ] Database uses strong password
- [ ] SSL/TLS enabled (WSS for WebSocket)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Database connection pooling configured
- [ ] Error messages don't expose sensitive info

## Support & Resources

- **Documentation:** [README.md](./README.md)
- **Backend Docs:** [backend/README.md](./backend/README.md)
- **GitHub Issues:** https://github.com/dreyxd/kolspot/issues
- **Helius Docs:** https://docs.helius.xyz
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

---

**Last Updated:** 2025-01-18  
**Version:** 1.0.0
