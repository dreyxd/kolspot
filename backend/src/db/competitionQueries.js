import { pool } from './connection.js';

/**
 * Get all competitions
 */
export async function getAllCompetitions() {
  try {
    const result = await pool.query(
      'SELECT * FROM competitions ORDER BY start_time DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return [];
  }
}

/**
 * Get competition by ID
 */
export async function getCompetitionById(competitionId) {
  try {
    const result = await pool.query(
      'SELECT * FROM competitions WHERE id = $1',
      [competitionId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching competition:', error);
    return null;
  }
}

/**
 * Get active competition
 */
export async function getActiveCompetition() {
  try {
    const result = await pool.query(
      `SELECT * FROM competitions 
       WHERE status = 'active' 
       ORDER BY start_time DESC 
       LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching active competition:', error);
    return null;
  }
}

/**
 * Get latest finished competition
 */
export async function getLatestFinishedCompetition() {
  try {
    const result = await pool.query(
      `SELECT * FROM competitions 
       WHERE status = 'finished' 
       ORDER BY end_time DESC 
       LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching latest finished competition:', error);
    return null;
  }
}

/**
 * Create a new competition
 */
export async function createCompetition(data) {
  const { name, status, startTime, endTime, totalPrizePoolSol } = data;
  try {
    const result = await pool.query(
      `INSERT INTO competitions (name, status, start_time, end_time, total_prize_pool_sol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, status, startTime, endTime, totalPrizePoolSol]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
}

/**
 * Update competition status
 */
export async function updateCompetitionStatus(competitionId, status) {
  try {
    const result = await pool.query(
      'UPDATE competitions SET status = $1 WHERE id = $2 RETURNING *',
      [status, competitionId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating competition status:', error);
    return null;
  }
}

/**
 * Register wallet for competition
 */
export async function registerForCompetition(competitionId, walletAddress, initialBalanceUsd) {
  try {
    const result = await pool.query(
      `INSERT INTO competition_entries (competition_id, wallet_address, initial_balance_usd)
       VALUES ($1, $2, $3)
       ON CONFLICT (competition_id, wallet_address) 
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [competitionId, walletAddress, initialBalanceUsd]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error registering for competition:', error);
    throw error;
  }
}

/**
 * Get competition entry by wallet
 */
export async function getCompetitionEntry(competitionId, walletAddress) {
  try {
    const result = await pool.query(
      `SELECT * FROM competition_entries 
       WHERE competition_id = $1 AND wallet_address = $2`,
      [competitionId, walletAddress]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching competition entry:', error);
    return null;
  }
}

/**
 * Get all entries for a competition
 */
export async function getCompetitionEntries(competitionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM competition_entries 
       WHERE competition_id = $1 
       ORDER BY rank ASC NULLS LAST, performance_percent DESC NULLS LAST`,
      [competitionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching competition entries:', error);
    return [];
  }
}

/**
 * Get top 5 winners for a competition
 */
export async function getCompetitionWinners(competitionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM competition_entries 
       WHERE competition_id = $1 AND is_winner = true 
       ORDER BY rank ASC 
       LIMIT 5`,
      [competitionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching competition winners:', error);
    return [];
  }
}

/**
 * Update entry performance
 */
export async function updateEntryPerformance(entryId, finalBalanceUsd, performancePercent) {
  try {
    const result = await pool.query(
      `UPDATE competition_entries 
       SET final_balance_usd = $1, performance_percent = $2 
       WHERE id = $3 
       RETURNING *`,
      [finalBalanceUsd, performancePercent, entryId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating entry performance:', error);
    return null;
  }
}

/**
 * Finalize competition rankings
 */
export async function finalizeCompetition(competitionId) {
  try {
    // Update ranks based on performance
    await pool.query(
      `UPDATE competition_entries e
       SET rank = subq.rank
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY performance_percent DESC NULLS LAST) as rank
         FROM competition_entries
         WHERE competition_id = $1 AND performance_percent IS NOT NULL
       ) subq
       WHERE e.id = subq.id`,
      [competitionId]
    );

    // Mark top 5 as winners
    await pool.query(
      `UPDATE competition_entries 
       SET is_winner = true 
       WHERE competition_id = $1 AND rank <= 5`,
      [competitionId]
    );

    // Update competition status to finished
    await updateCompetitionStatus(competitionId, 'finished');

    return true;
  } catch (error) {
    console.error('Error finalizing competition:', error);
    return false;
  }
}
