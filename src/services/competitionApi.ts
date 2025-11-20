const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export interface Competition {
  id: number;
  name: string;
  status: 'upcoming' | 'active' | 'finished';
  start_time: string;
  end_time: string;
  total_prize_pool_sol: number;
  created_at: string;
  updated_at: string;
}

export interface CompetitionEntry {
  id: number;
  competition_id: number;
  wallet_address: string;
  initial_balance_usd: number | null;
  final_balance_usd: number | null;
  performance_percent: number | null;
  rank: number | null;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Leaderboard {
  competition: Competition;
  leaderboard: CompetitionEntry[];
  lastUpdated: string;
}

/**
 * Get active competition
 */
export async function getActiveCompetition(): Promise<{ competition: Competition | null; totalParticipants: number; entries: CompetitionEntry[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/competition/active`);
    if (!response.ok) throw new Error('Failed to fetch active competition');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active competition:', error);
    return { competition: null, totalParticipants: 0, entries: [] };
  }
}

/**
 * Get latest finished competition with winners
 */
export async function getLatestFinishedCompetition(): Promise<{ competition: Competition | null; winners: CompetitionEntry[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/competition/latest-finished`);
    if (!response.ok) throw new Error('Failed to fetch finished competition');
    return await response.json();
  } catch (error) {
    console.error('Error fetching finished competition:', error);
    return { competition: null, winners: [] };
  }
}

/**
 * Get competition leaderboard
 */
export async function getCompetitionLeaderboard(competitionId: number): Promise<Leaderboard | null> {
  try {
    const response = await fetch(`${API_BASE}/api/competition/${competitionId}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }
}

/**
 * Register wallet for competition
 */
export async function registerForCompetition(competitionId: number, walletAddress: string): Promise<{ message: string; entry: CompetitionEntry }> {
  try {
    const response = await fetch(`${API_BASE}/api/competition/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitionId, walletAddress })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering for competition:', error);
    throw error;
  }
}

/**
 * Check if wallet is registered
 */
export async function getWalletEntry(competitionId: number, walletAddress: string): Promise<CompetitionEntry | null> {
  try {
    const response = await fetch(`${API_BASE}/api/competition/${competitionId}/entry/${walletAddress}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.entry;
  } catch (error) {
    console.error('Error checking wallet entry:', error);
    return null;
  }
}
