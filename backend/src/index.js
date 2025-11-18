import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import kolRoutes from './routes/kol.js';
import coinsRoutes from './routes/coins.js';
import webhookRoutes from './routes/webhook.js';
import { initWebSocket } from './websocket/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
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

// Initialize WebSocket
initWebSocket(server);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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
