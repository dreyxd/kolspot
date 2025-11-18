const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BASE_URL = process.env.HELIUS_BASE_URL || 'https://api.helius.xyz';

export const fetchTransactions = async (walletAddress, limit = 30) => {
  try {
    const response = await fetch(
      `${HELIUS_BASE_URL}/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions from Helius:', error);
    throw error;
  }
};

export const fetchTokenMetadata = async (mintAddresses) => {
  try {
    const response = await fetch(
      `${HELIUS_BASE_URL}/v0/tokens/metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: mintAddresses })
      }
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }
};

export const parseTransactionForBuys = (walletAddress, transactions) => {
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const buys = [];

  for (const tx of transactions) {
    // Check for outgoing SOL (payment for token)
    const nativeTransfers = tx.nativeTransfers || [];
    const outgoingSol = nativeTransfers
      .filter(nt => nt.fromUserAccount === walletAddress)
      .reduce((sum, nt) => sum + (nt.amount || 0), 0);

    if (outgoingSol < 1_000_000_000) continue; // Skip < 1 SOL transactions

    // Check for incoming token transfers (received tokens)
    const tokenTransfers = tx.tokenTransfers || [];
    for (const tf of tokenTransfers) {
      if (tf.toUserAccount === walletAddress && tf.mint !== SOL_MINT) {
        buys.push({
          walletAddress,
          tokenMint: tf.mint,
          tokenSymbol: tf.symbol || 'UNKNOWN',
          tokenAmount: tf.tokenAmount,
          timestamp: new Date(tx.timestamp * 1000),
          transactionSignature: tx.signature,
          solSpent: outgoingSol / 1e9
        });
      }
    }
  }

  return buys;
};

export const isPumpFunToken = (metadata) => {
  if (!metadata) return false;
  
  const uri = metadata.uri || metadata.legacyMetadata?.uri || '';
  return uri.includes('pump.fun') || uri.includes('cf-ipfs.com');
};
