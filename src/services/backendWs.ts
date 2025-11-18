// WebSocket connection to backend for real-time KOL trades
const WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:3001/api/stream/kol-buys';

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

type TradeCallback = (trade: any) => void;
const subscribers: Set<TradeCallback> = new Set();

export const connectBackendWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    console.log('WebSocket already connected or connecting');
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✓ Connected to backend WebSocket');
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'trade' && message.data) {
          // Notify all subscribers
          subscribers.forEach(callback => {
            try {
              callback(message.data);
            } catch (error) {
              console.error('Error in trade callback:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      ws = null;

      // Attempt reconnection
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Reconnecting in ${RECONNECT_DELAY}ms... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(connectBackendWebSocket, RECONNECT_DELAY);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }
};

export const subscribeToTrades = (callback: TradeCallback): (() => void) => {
  subscribers.add(callback);
  
  // Connect if not already connected
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    connectBackendWebSocket();
  }

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
    
    // Close connection if no more subscribers
    if (subscribers.size === 0 && ws) {
      ws.close();
      ws = null;
    }
  };
};

export const disconnectBackendWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  subscribers.clear();
  reconnectAttempts = 0;
};
