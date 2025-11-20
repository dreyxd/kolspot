import express from 'express';
import {
  getActiveCompetition,
  getLatestFinishedCompetition,
  getCompetitionById,
  getCompetitionEntries,
  getCompetitionWinners,
  getCompetitionEntry,
  registerForCompetition,
  updateEntryPerformance,
  finalizeCompetition,
  getAllCompetitions,
  createCompetition,
  updateCompetitionStatus
} from '../db/competitionQueries.js';
import { getWalletValueAtTime, getCurrentWalletValue, calculatePerformance, updateCompetitionPerformance } from '../services/walletPerformance.js';

const router = express.Router();

/**
 * GET /api/competition/active
 * Get currently active competition
 */
router.get('/active', async (req, res) => {
  try {
    const competition = await getActiveCompetition();
    if (!competition) {
      return res.json({ competition: null });
    }

    const entries = await getCompetitionEntries(competition.id);
    
    res.json({
      competition,
      totalParticipants: entries.length,
      entries: entries.slice(0, 10) // Return top 10 for preview
    });
  } catch (error) {
    console.error('Error fetching active competition:', error);
    res.status(500).json({ error: 'Failed to fetch active competition' });
  }
});

/**
 * GET /api/competition/latest-finished
 * Get latest finished competition with top 5 winners
 */
router.get('/latest-finished', async (req, res) => {
  try {
    const competition = await getLatestFinishedCompetition();
    if (!competition) {
      return res.json({ competition: null, winners: [] });
    }

    const winners = await getCompetitionWinners(competition.id);
    
    res.json({
      competition,
      winners
    });
  } catch (error) {
    console.error('Error fetching latest finished competition:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});

/**
 * GET /api/competition/:id
 * Get competition details and leaderboard
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await getCompetitionById(id);
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const entries = await getCompetitionEntries(id);
    
    res.json({
      competition,
      entries,
      totalParticipants: entries.length
    });
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});

/**
 * GET /api/competition/:id/leaderboard
 * Get competition leaderboard
 */
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await getCompetitionById(id);
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    let entries = await getCompetitionEntries(id);
    
    // If competition is active, update live performance
    if (competition.status === 'active') {
      entries = await updateCompetitionPerformance(id, entries);
    }
    
    res.json({
      competition,
      leaderboard: entries,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * POST /api/competition/register
 * Register wallet for competition
 */
router.post('/register', async (req, res) => {
  try {
    const { competitionId, walletAddress } = req.body;

    if (!competitionId || !walletAddress) {
      return res.status(400).json({ error: 'Missing competitionId or walletAddress' });
    }

    // Validate Solana wallet address format (basic check)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    const competition = await getCompetitionById(competitionId);
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Check if competition is open for registration
    if (competition.status === 'finished') {
      return res.status(400).json({ error: 'Competition has already finished' });
    }

    // Check if already registered
    const existing = await getCompetitionEntry(competitionId, walletAddress);
    if (existing) {
      return res.json({
        message: 'Already registered',
        entry: existing
      });
    }

    // Get initial wallet value
    const initialValue = await getWalletValueAtTime(walletAddress, new Date(competition.start_time));

    // Register the wallet
    const entry = await registerForCompetition(competitionId, walletAddress, initialValue);

    res.json({
      message: 'Successfully registered',
      entry
    });
  } catch (error) {
    console.error('Error registering for competition:', error);
    res.status(500).json({ error: 'Failed to register for competition' });
  }
});

/**
 * GET /api/competition/:id/entry/:walletAddress
 * Get specific entry for a wallet
 */
router.get('/:id/entry/:walletAddress', async (req, res) => {
  try {
    const { id, walletAddress } = req.params;
    const entry = await getCompetitionEntry(id, walletAddress);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ entry });
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

/**
 * POST /api/competition/:id/finalize
 * Finalize competition and determine winners (Admin only)
 */
router.post('/:id/finalize', async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await getCompetitionById(id);
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.status === 'finished') {
      return res.status(400).json({ error: 'Competition already finalized' });
    }

    // Get all entries and update final performance
    const entries = await getCompetitionEntries(id);
    
    for (const entry of entries) {
      const finalValue = await getCurrentWalletValue(entry.wallet_address);
      const performancePercent = calculatePerformance(entry.initial_balance_usd, finalValue);
      await updateEntryPerformance(entry.id, finalValue, performancePercent);
    }

    // Finalize rankings and mark winners
    await finalizeCompetition(id);

    const winners = await getCompetitionWinners(id);

    res.json({
      message: 'Competition finalized',
      winners
    });
  } catch (error) {
    console.error('Error finalizing competition:', error);
    res.status(500).json({ error: 'Failed to finalize competition' });
  }
});

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /api/competition/admin/all
 * Get all competitions (Admin only)
 */
router.get('/admin/all', async (req, res) => {
  try {
    const competitions = await getAllCompetitions();
    res.json({ competitions });
  } catch (error) {
    console.error('Error fetching all competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

/**
 * POST /api/competition/admin/create
 * Create new competition (Admin only)
 */
router.post('/admin/create', async (req, res) => {
  try {
    const { name, status, startTime, endTime, totalPrizePoolSol } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const competition = await createCompetition({
      name,
      status: status || 'upcoming',
      startTime,
      endTime,
      totalPrizePoolSol: totalPrizePoolSol || 1.0
    });

    res.json({
      message: 'Competition created',
      competition
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ error: 'Failed to create competition' });
  }
});

/**
 * PATCH /api/competition/admin/:id/status
 * Update competition status (Admin only)
 */
router.patch('/admin/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['upcoming', 'active', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const competition = await updateCompetitionStatus(id, status);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json({
      message: 'Status updated',
      competition
    });
  } catch (error) {
    console.error('Error updating competition status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
