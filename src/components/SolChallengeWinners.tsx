import { useState, useEffect } from 'react';
import { getLatestFinishedCompetition, Competition, CompetitionEntry } from '../services/competitionApi';

export default function SolChallengeWinners() {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [winners, setWinners] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      const data = await getLatestFinishedCompetition();
      setCompetition(data.competition);
      setWinners(data.winners);
      setLoading(false);
    } catch (error) {
      console.error('Error loading winners:', error);
      setLoading(false);
    }
  };

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatPerformance = (perf: number | null) => {
    if (perf === null || perf === undefined) return '-';
    const prefix = perf >= 0 ? '+' : '';
    return `${prefix}${perf.toFixed(2)}%`;
  };

  const getTitleByRank = (rank: number | null) => {
    if (!rank) return 'Participant';
    const titles: Record<number, string> = {
      1: '🏆 1 SOL Champion',
      2: '🥈 Runner-Up',
      3: '🥉 Third Place',
      4: 'Top 5',
      5: 'Top 5'
    };
    return titles[rank] || 'Participant';
  };

  const getRankBadge = (rank: number | null) => {
    if (!rank) return null;
    const badges: Record<number, string> = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return badges[rank] || `#${rank}`;
  };

  if (loading) {
    return (
      <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">1 SOL Challenge - Top 5</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!competition || winners.length === 0) {
    return (
      <div className="bg-surface/60 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">1 SOL Challenge - Top 5</h3>
        <p className="text-sm text-neutral-500 text-center py-4">
          No completed challenges yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-surface/80 to-surface/40 border border-accent/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-accent/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🏆</span>
          <h3 className="text-lg font-bold text-white">1 SOL Challenge - Top 5</h3>
        </div>
        <p className="text-xs text-neutral-400">{competition.name}</p>
      </div>

      <div className="p-4 space-y-3">
        {winners.map((winner) => (
          <div
            key={winner.id}
            className="bg-black/20 border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getRankBadge(winner.rank)}</span>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {getTitleByRank(winner.rank)}
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    {shortAddress(winner.wallet_address)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${
                    (winner.performance_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPerformance(winner.performance_percent)}
                </div>
              </div>
            </div>
            
            {winner.rank === 1 && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-400/20 text-xs font-semibold">
                  🎉 Challenge Winner
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="text-xs text-neutral-500 text-center">
          Prize Pool: {competition.total_prize_pool_sol} SOL
        </div>
      </div>
    </div>
  );
}
