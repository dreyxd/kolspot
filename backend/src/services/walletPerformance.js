/**
 * Mock service to fetch wallet portfolio performance
 * In production, this would use Helius/Moralis APIs
 */

/**
 * Get wallet portfolio value in USD at a specific timestamp
 * @param {string} walletAddress - Solana wallet address
 * @param {Date} timestamp - Point in time to check
 * @returns {Promise<number>} Portfolio value in USD
 */
export async function getWalletValueAtTime(walletAddress, timestamp) {
  // TODO: Integrate with Helius/Moralis to get actual wallet value
  // For now, return mock data
  console.log(`[MOCK] Getting wallet value for ${walletAddress} at ${timestamp}`);
  
  // Mock random portfolio value between $100 - $10,000
  const mockValue = Math.random() * 9900 + 100;
  return mockValue;
}

/**
 * Get current wallet portfolio value in USD
 * @param {string} walletAddress - Solana wallet address
 * @returns {Promise<number>} Current portfolio value in USD
 */
export async function getCurrentWalletValue(walletAddress) {
  // TODO: Integrate with Helius/Moralis to get actual wallet value
  console.log(`[MOCK] Getting current wallet value for ${walletAddress}`);
  
  // Mock random portfolio value between $100 - $10,000
  const mockValue = Math.random() * 9900 + 100;
  return mockValue;
}

/**
 * Calculate performance percentage
 * @param {number} initialValue - Initial portfolio value
 * @param {number} finalValue - Final portfolio value
 * @returns {number} Performance percentage
 */
export function calculatePerformance(initialValue, finalValue) {
  if (!initialValue || initialValue === 0) return 0;
  return ((finalValue - initialValue) / initialValue) * 100;
}

/**
 * Update all entries for a competition with latest performance data
 * @param {number} competitionId - Competition ID
 * @param {Array} entries - Competition entries
 * @returns {Promise<Array>} Updated entries with performance data
 */
export async function updateCompetitionPerformance(competitionId, entries) {
  const updates = [];
  
  for (const entry of entries) {
    try {
      // Get current wallet value
      const finalValue = await getCurrentWalletValue(entry.wallet_address);
      
      // Calculate performance if we have initial value
      let performancePercent = 0;
      if (entry.initial_balance_usd) {
        performancePercent = calculatePerformance(entry.initial_balance_usd, finalValue);
      }
      
      updates.push({
        ...entry,
        final_balance_usd: finalValue,
        performance_percent: performancePercent
      });
    } catch (error) {
      console.error(`Error updating performance for entry ${entry.id}:`, error);
      updates.push(entry);
    }
  }
  
  return updates;
}
