import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import kolRoutes from './routes/kol.js';
import coinsRoutes from './routes/coins.js';
import webhookRoutes from './routes/webhook.js';
import terminalRoutes from './routes/terminal.js';
import leaderboardRoutes from './routes/leaderboard.js';
import kolActivityRoutes from './routes/kol-activity.js';
import { initWebSocket } from './websocket/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://kolspot.live',
      'https://www.kolspot.live'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/kol', kolRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/kol-activity', kolActivityRoutes);

// Initialize WebSocket
initWebSocket(server);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - just log the error
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   KOLSpot Backend Server Started      ║
╠════════════════════════════════════════╣
║   Port: ${PORT.toString().padEnd(30)} ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(22)} ║
║   WebSocket: /api/stream/kol-buys     ║
╚════════════════════════════════════════╝
  `);
});

export default app;
