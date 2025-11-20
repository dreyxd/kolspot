-- Competition tables for 1 SOL Challenge

CREATE TABLE IF NOT EXISTS competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('upcoming', 'active', 'finished')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_prize_pool_sol DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_entries (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  wallet_address VARCHAR(64) NOT NULL,
  initial_balance_usd DECIMAL(15, 2),
  final_balance_usd DECIMAL(15, 2),
  performance_percent DECIMAL(10, 4),
  rank INTEGER,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(competition_id, wallet_address)
);

CREATE INDEX idx_competition_entries_competition ON competition_entries(competition_id);
CREATE INDEX idx_competition_entries_wallet ON competition_entries(wallet_address);
CREATE INDEX idx_competition_entries_rank ON competition_entries(competition_id, rank);
CREATE INDEX idx_competitions_status ON competitions(status);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_entries_updated_at BEFORE UPDATE ON competition_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
