const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export interface BackendTransaction {
  walletAddress: string;
  tokenMint: string;
  tokenSymbol: string;
  amount: number;
  timestamp: string;
  signature: string;
}

export interface TokenKolCount {
  tokenMint: string;
  tokenSymbol: string;
  distinctKolsCount: number;
  mostRecentBuyTimestamp: string;
  totalVolume: number;
}

/**
 * Fetch KOL transactions from backend
 */
export const fetchKolTransactions = async (
  walletAddress: string,
  tokenFilter?: string[]
): Promise<{ success: boolean; transactions: BackendTransaction[] }> => {
  try {
    const response = await fetch(`${API_URL}/api/kol/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, tokenFilter })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching KOL transactions:', error);
    throw error;
  }
};

/**
 * Get tokens grouped by KOL count
 */
export const getTokensByKolCount = async (hours: number = 24): Promise<TokenKolCount[]> => {
  try {
    const response = await fetch(`${API_URL}/api/coins/kols-count?hours=${hours}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tokens by KOL count:', error);
    throw error;
  }
};

/**
 * Get recent trades
 */
export const getRecentTrades = async (limit: number = 100): Promise<BackendTransaction[]> => {
  try {
    console.log(`🔄 Fetching recent trades from: ${API_URL}/api/coins/recent-trades?limit=${limit}`);
    const response = await fetch(`${API_URL}/api/coins/recent-trades?limit=${limit}`);

    if (!response.ok) {
      console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Backend returned non-JSON response (likely HTML error page)');
      return [];
    }

    const trades = await response.json();
    console.log(`✅ Loaded ${trades.length} recent trades from backend`);
    return trades;
  } catch (error) {
    console.error('❌ Error fetching recent trades:', error);
    return []; // Return empty array on error
  }
};

/**
 * Health check
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};
