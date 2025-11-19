// WebSocket connection for real-time terminal token updates
const WS_URL = import.meta.env.VITE_BACKEND_WS_URL?.replace('/kol-buys', '/terminal') || 'ws://localhost:3001/api/stream/terminal';

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export interface TokenUpdate {
  tokenMint: string;
  tokenPrice?: number;
  tokenMarketCap?: number;
  tokenLiquidity?: number;
  isBonded?: boolean;
  latestTrade?: string;
  newBuyer?: {
    walletAddress: string;
    amount: number;
    solAmount: number;
    timestamp: string;
    signature: string;
  };
}

export interface TerminalUpdate {
  type: 'token_update' | 'new_token' | 'token_moved';
  category?: 'early' | 'bonding' | 'graduated';
  data: TokenUpdate | any;
}

type UpdateCallback = (update: TerminalUpdate) => void;
const subscribers: Set<UpdateCallback> = new Set();

export const connectTerminalWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✓ Connected to Terminal WebSocket');
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type && message.data) {
          subscribers.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in terminal update callback:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing Terminal WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Terminal WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Terminal WebSocket disconnected');
      ws = null;

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(connectTerminalWebSocket, RECONNECT_DELAY);
      }
    };
  } catch (error) {
    console.error('Failed to create Terminal WebSocket connection:', error);
  }
};

export const subscribeToTerminalUpdates = (callback: UpdateCallback): (() => void) => {
  subscribers.add(callback);
  
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    connectTerminalWebSocket();
  }

  return () => {
    subscribers.delete(callback);
    
    if (subscribers.size === 0 && ws) {
      ws.close();
      ws = null;
    }
  };
};

export const disconnectTerminalWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  subscribers.clear();
  reconnectAttempts = 0;
};
