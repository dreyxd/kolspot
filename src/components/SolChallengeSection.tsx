import { useState, useEffect } from 'react';
import { getActiveCompetition, getCompetitionLeaderboard, registerForCompetition, Competition, CompetitionEntry } from '../services/competitionApi';
import { Link } from 'react-router-dom';

// Mock wallet connection - replace with actual Solana wallet adapter
const useWallet = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = () => {
    // TODO: Integrate with @solana/wallet-adapter-react
    // For now, use mock wallet
    const mockWallet = 'SoL1MockWa11etAddr3ssF0rTest1ng' + Math.random().toString(36).substring(2, 10);
    setPublicKey(mockWallet);
    setConnected(true);
  };

  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
  };

  return { connected, publicKey, connect, disconnect };
};

export default function SolChallengeSection() {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [leaderboard, setLeaderboard] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { connected, publicKey, connect } = useWallet();

  useEffect(() => {
    loadCompetition();
    const interval = setInterval(() => {
      if (competition?.status === 'active') {
        loadLeaderboard();
      }
    }, 30000); // Refresh every 30 seconds if active

    return () => clearInterval(interval);
  }, [competition?.id]);

  const loadCompetition = async () => {
    try {
      const data = await getActiveCompetition();
      setCompetition(data.competition);
      if (data.competition) {
        loadLeaderboard();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading competition:', error);
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!competition) return;
    
    try {
      const data = await getCompetitionLeaderboard(competition.id);
      if (data) {
        setLeaderboard(data.leaderboard);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleRegister = async () => {
    if (!connected || !publicKey || !competition) {
      connect();
      return;
    }

    setRegistering(true);
    try {
      await registerForCompetition(competition.id, publicKey);
      setIsRegistered(true);
      loadLeaderboard();
    } catch (error: any) {
      alert(error.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-blue-500/15 text-blue-300 border-blue-400/20',
      active: 'bg-green-500/15 text-green-300 border-green-400/20',
      finished: 'bg-purple-500/15 text-purple-300 border-purple-400/20'
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeRemaining = () => {
    if (!competition) return '';
    const now = new Date().getTime();
    const end = new Date(competition.end_time).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatPerformance = (perf: number | null) => {
    if (perf === null || perf === undefined) return '-';
    const prefix = perf >= 0 ? '+' : '';
    return `${prefix}${perf.toFixed(2)}%`;
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
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
            <p className="text-neutral-400 mt-4">Loading 1 SOL Challenge...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!competition) {
    return (
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              1 SOL Challenge
            </h2>
            <p className="text-neutral-400">No active challenge at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-accent">Trading Competition</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            1 SOL Challenge
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Compete with other traders for SOL rewards. Top 5 performers win from our prize pool funded by creator-fee rewards.
          </p>
        </div>

        {/* Competition Card */}
        <div className="bg-gradient-to-br from-surface/80 to-surface/40 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{competition.name}</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md border text-sm ${getStatusBadge(competition.status)}`}>
                  {competition.status.toUpperCase()}
                </span>
                {competition.status === 'active' && (
                  <span className="text-sm text-neutral-400">
                    ⏱️ {getTimeRemaining()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-500 mb-1">Prize Pool</div>
              <div className="text-3xl font-bold text-accent">
                {competition.total_prize_pool_sol} SOL
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-xs text-neutral-500 mb-1">Start Time</div>
              <div className="text-sm text-white">{formatTime(competition.start_time)}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-xs text-neutral-500 mb-1">End Time</div>
              <div className="text-sm text-white">{formatTime(competition.end_time)}</div>
            </div>
          </div>

          {competition.status !== 'finished' && (
            <button
              onClick={handleRegister}
              disabled={registering || isRegistered}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isRegistered
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30 cursor-not-allowed'
                  : 'bg-accent hover:opacity-90 text-black'
              }`}
            >
              {registering ? (
                'Registering...'
              ) : isRegistered ? (
                '✓ Registered'
              ) : connected ? (
                'Register for Challenge'
              ) : (
                'Connect Wallet to Register'
              )}
            </button>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-surface/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Leaderboard</h3>
            {lastUpdated && (
              <span className="text-xs text-neutral-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Wallet</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-400 uppercase">Performance</th>
                  {competition.status === 'finished' && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-400 uppercase">Status</th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      No participants yet. Be the first to register!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-white/5 transition-colors ${
                        entry.rank && entry.rank <= 5 ? 'bg-accent/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getRankBadge(entry.rank)}</span>
                          {entry.rank && entry.rank <= 5 && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">TOP 5</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-neutral-300">
                          {shortAddress(entry.wallet_address)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold ${
                            (entry.performance_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatPerformance(entry.performance_percent)}
                        </span>
                      </td>
                      {competition.status === 'finished' && (
                        <td className="px-6 py-4 text-center">
                          {entry.is_winner && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-400/20 text-xs font-semibold">
                              🏆 WINNER
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <Link
                          to="/terminal"
                          className="text-accent hover:text-accent/80 text-sm font-medium"
                        >
                          View Terminal →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-xs text-neutral-500">
          Prize pool funded by KOLSpot creator-fee rewards
        </div>
      </div>
    </section>
  );
}
