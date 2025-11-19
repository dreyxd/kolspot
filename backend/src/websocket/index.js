import { WebSocketServer } from 'ws';
import { saveTransaction } from '../db/queries.js';
import * as cache from '../utils/cache.js';

let wss = null;
let terminalWss = null;
const clients = new Set();
const terminalClients = new Set();

export const initWebSocket = (server) => {
  // KOL buys stream
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

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to KOL buy stream' }));
  });

  // Terminal updates stream
  terminalWss = new WebSocketServer({ server, path: '/api/stream/terminal' });

  terminalWss.on('connection', (ws) => {
    console.log('New Terminal WebSocket client connected');
    terminalClients.add(ws);

    ws.on('close', () => {
      console.log('Terminal WebSocket client disconnected');
      terminalClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('Terminal WebSocket error:', error);
      terminalClients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Terminal stream' }));
  });

  console.log('✓ WebSocket server initialized on /api/stream/kol-buys');
  console.log('✓ Terminal WebSocket server initialized on /api/stream/terminal');
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

  // Also broadcast to terminal clients with enriched data
  broadcastTerminalUpdate({
    type: 'token_update',
    data: {
      tokenMint: transaction.tokenMint,
      latestTrade: transaction.timestamp,
      newBuyer: {
        walletAddress: transaction.walletAddress,
        amount: transaction.amount,
        solAmount: transaction.solAmount,
        timestamp: transaction.timestamp,
        signature: transaction.signature
      }
    }
  });
};

export const broadcastTerminalUpdate = (update) => {
  const message = JSON.stringify(update);
  
  terminalClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};

export default { initWebSocket, broadcastTransaction };
