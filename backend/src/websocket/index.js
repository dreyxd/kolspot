import { WebSocketServer } from 'ws';
import { saveTransaction } from '../db/queries.js';
import * as cache from '../utils/cache.js';

let wss = null;
const clients = new Set();

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/api/stream/kol-buys' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to KOL buy stream' }));
  });

  console.log('✓ WebSocket server initialized on /api/stream/kol-buys');
};

export const broadcastTransaction = async (transaction) => {
  const message = JSON.stringify({
    type: 'trade',
    data: {
      walletAddress: transaction.walletAddress,
      tokenSymbol: transaction.tokenSymbol,
      tokenMint: transaction.tokenMint,
      amount: transaction.amount,
      solAmount: transaction.solAmount,
      side: transaction.side || 'BUY',
      timestamp: transaction.timestamp,
      signature: transaction.signature
    }
  });

  // Broadcast to all connected clients
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });

  // Save to database
  try {
    await saveTransaction(transaction);
    // Invalidate cache
    cache.del('kols-count');
  } catch (error) {
    console.error('Error saving broadcasted transaction:', error);
  }
};

export default { initWebSocket, broadcastTransaction };
