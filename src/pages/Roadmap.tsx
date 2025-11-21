import SpotlightBackground from '../components/SpotlightBackground';

export default function Roadmap() {
  const roadmapPhases = [
    {
      phase: "Phase 1: Foundation",
      status: "Completed",
      items: [
        {
          title: "Platform Launch",
          description: "KOLSpot landing page and core infrastructure deployed",
          completed: true
        },
        {
          title: "KOL Terminal Development",
          description: "Real-time tracking system for Key Opinion Leader trades",
          completed: true
        },
        {
          title: "Initial Token Integration",
          description: "Support for Solana-based tokens and trading data",
          completed: true
        }
      ]
    },
    {
      phase: "Phase 2: Token Launch",
      status: "In Progress",
      items: [
        {
          title: "Launch on Pump.fun",
          description: "Official $KOLS token launch on Pump.fun with fair distribution",
          completed: false
        },
        {
          title: "Lock Asset & Security",
          description: "Liquidity lock and team token vesting for investor protection",
          completed: false
        },
        {
          title: "DEX Listing with 50X Boost",
          description: "Initial DEX offering with boosted liquidity incentives",
          completed: false
        },
        {
          title: "Bonding Curve Implementation",
          description: "Dynamic pricing mechanism for sustainable token economics",
          completed: false
        }
      ]
    },
    {
      phase: "Phase 3: Platform Enhancement",
      status: "Upcoming",
      items: [
        {
          title: "API Upgrade v2.0",
          description: "Enhanced API with improved performance, real-time WebSocket updates, and extended data coverage",
          completed: false
        },
        {
          title: "Advanced Analytics Dashboard",
          description: "Comprehensive trading insights, wallet performance metrics, and portfolio tracking",
          completed: false
        },
        {
          title: "Mobile Application",
          description: "Native iOS and Android apps for on-the-go KOL tracking",
          completed: false
        },
        {
          title: "Multi-Chain Support",
          description: "Expand beyond Solana to Ethereum, Base, and other major chains",
          completed: false
        }
      ]
    },
    {
      phase: "Phase 4: Tournament & Gamification",
      status: "Upcoming",
      items: [
        {
          title: "Trading Tournament Launch",
          description: "Competitive trading events with SOL and $KOLS token prizes",
          completed: false
        },
        {
          title: "Leaderboard & Rankings",
          description: "Global and seasonal rankings for top performers",
          completed: false
        },
        {
          title: "Achievement System",
          description: "Unlock badges, NFTs, and exclusive perks through platform engagement",
          completed: false
        },
        {
          title: "Referral & Rewards Program",
          description: "Earn $KOLS tokens for bringing new traders to the platform",
          completed: false
        }
      ]
    },
    {
      phase: "Phase 5: Partnerships & Expansion",
      status: "Future",
      items: [
        {
          title: "Strategic Collaborations",
          description: "Partner with leading DeFi protocols, CEXs, and crypto influencers",
          completed: false
        },
        {
          title: "Institutional Tools",
          description: "Professional-grade API access and white-label solutions",
          completed: false
        },
        {
          title: "Community DAO",
          description: "Transition governance to $KOLS token holders for platform decisions",
          completed: false
        },
        {
          title: "Global Marketing Campaign",
          description: "Expand reach through sponsorships, events, and influencer partnerships",
          completed: false
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <SpotlightBackground>
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent-light via-accent to-accent-soft bg-clip-text text-transparent">
            Roadmap
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Our journey to becoming the leading platform for tracking and competing in crypto trading
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-5xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-light via-accent to-accent-soft"></div>

          {roadmapPhases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="relative mb-16">
              {/* Phase marker */}
              <div className="absolute left-8 md:left-1/2 -ml-4 w-8 h-8 rounded-full bg-accent border-4 border-background shadow-glow"></div>

              <div className="ml-20 md:ml-0 md:grid md:grid-cols-2 md:gap-8">
                {/* Phase info - left on desktop */}
                <div className={`mb-4 md:mb-0 ${phaseIndex % 2 === 0 ? 'md:text-right md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border mb-3 ${getStatusColor(phase.status)}`}>
                    {phase.status}
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-white">{phase.phase}</h2>
                </div>

                {/* Phase items - right on desktop */}
                <div className={`${phaseIndex % 2 === 0 ? 'md:col-start-2 md:pl-12' : 'md:col-start-1 md:pr-12 md:row-start-1'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-accent/30 transition-all duration-300">
                    <div className="space-y-4">
                      {phase.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-3 group">
                          <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            item.completed 
                              ? 'border-green-500 bg-green-500/20' 
                              : 'border-accent-light bg-accent-light/10'
                          }`}>
                            {item.completed && (
                              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1 group-hover:text-accent-light transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-neutral-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center bg-gradient-to-r from-accent-soft/20 to-accent/20 rounded-2xl p-10 border border-accent/30">
          <h2 className="text-3xl font-bold mb-4 text-white">Join Us on This Journey</h2>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Be part of the revolution in crypto trading intelligence. Track the best, compete with the best, and become the best.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/kol-terminal" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
              <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
              <span className="txt relative z-10 text-white">KOL Terminal</span>
            </a>
            <a href="https://app.kolspot.live" target="_blank" rel="noopener noreferrer" className="neon-btn relative overflow-hidden px-8 py-3 rounded-full font-semibold transition-all duration-300">
              <span className="span absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100"></span>
              <span className="txt relative z-10 text-white">Launch App</span>
            </a>
          </div>
          </div>
        </div>
      </main>
    </SpotlightBackground>
  );
}