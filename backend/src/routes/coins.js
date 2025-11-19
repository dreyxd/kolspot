import express from 'express';

const router = express.Router();

/**
 * Legacy endpoints removed.
 * Use /api/terminal/* endpoints instead:
 * - /api/terminal/early-plays
 * - /api/terminal/bonding
 * - /api/terminal/graduated
 * - /api/terminal/token/:mint
 */

// Redirect old endpoints to terminal
router.get('/kols-count', (req, res) => {
  res.status(410).json({ 
    error: 'Endpoint deprecated. Use /api/terminal/early-plays, /api/terminal/bonding, or /api/terminal/graduated instead.' 
  });
});

router.get('/recent-trades', (req, res) => {
  res.status(410).json({ 
    error: 'Endpoint deprecated. Use /api/terminal/* endpoints instead.' 
  });
});

export default router;
