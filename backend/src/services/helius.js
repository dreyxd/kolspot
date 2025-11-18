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

export const parseTransactions = (walletAddress, transactions) => {
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const trades = [];

  for (const tx of transactions) {
    const nativeTransfers = tx.nativeTransfers || [];
    const tokenTransfers = tx.tokenTransfers || [];

    // Check for outgoing SOL (BUY - paying for tokens)
    const outgoingSol = nativeTransfers
      .filter(nt => nt.fromUserAccount === walletAddress)
      .reduce((sum, nt) => sum + (nt.amount || 0), 0);

    // Check for incoming SOL (SELL - receiving payment)
    const incomingSol = nativeTransfers
      .filter(nt => nt.toUserAccount === walletAddress)
      .reduce((sum, nt) => sum + (nt.amount || 0), 0);

    // BUY: Outgoing SOL + Incoming token
    if (outgoingSol >= 100_000_000) { // Min 0.1 SOL
      for (const tf of tokenTransfers) {
        if (tf.toUserAccount === walletAddress && tf.mint !== SOL_MINT) {
          trades.push({
            walletAddress,
            tokenMint: tf.mint,
            tokenSymbol: tf.symbol || 'UNKNOWN',
            tokenAmount: tf.tokenAmount,
            solAmount: outgoingSol / 1e9,
            side: 'BUY',
            timestamp: new Date(tx.timestamp * 1000),
            transactionSignature: tx.signature
          });
        }
      }
    }

    // SELL: Outgoing token + Incoming SOL
    if (incomingSol >= 100_000_000) { // Min 0.1 SOL received
      for (const tf of tokenTransfers) {
        if (tf.fromUserAccount === walletAddress && tf.mint !== SOL_MINT) {
          trades.push({
            walletAddress,
            tokenMint: tf.mint,
            tokenSymbol: tf.symbol || 'UNKNOWN',
            tokenAmount: tf.tokenAmount,
            solAmount: incomingSol / 1e9,
            side: 'SELL',
            timestamp: new Date(tx.timestamp * 1000),
            transactionSignature: tx.signature
          });
        }
      }
    }
  }

  return trades;
};

// Legacy function for backwards compatibility
export const parseTransactionForBuys = (walletAddress, transactions) => {
  return parseTransactions(walletAddress, transactions).filter(t => t.side === 'BUY');
};

export const isPumpFunToken = (metadata) => {
  if (!metadata) return false;
  
  const uri = metadata.uri || metadata.legacyMetadata?.uri || '';
  return uri.includes('pump.fun') || uri.includes('cf-ipfs.com');
};
