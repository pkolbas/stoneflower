import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import plantRoutes from './routes/plants.js';
import speciesRoutes from './routes/species.js';
import userRoutes from './routes/users.js';
import testRoutes from './routes/testRoutes.js';
import { initBot } from './services/telegramBot.js';
import { startScheduler } from './services/scheduler.js';
import { seedSpecies } from './services/speciesService.js';
import prisma from './services/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.TELEGRAM_WEBAPP_URL || 'https://localhost:5173';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!BOT_TOKEN) {
  console.warn('WARNING: TELEGRAM_BOT_TOKEN not set. Bot features will be disabled.');
}

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'https://web.telegram.org'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const auth = BOT_TOKEN ? authMiddleware(BOT_TOKEN) : (_req: any, _res: any, next: any) => next();
const optionalAuth = BOT_TOKEN ? optionalAuthMiddleware(BOT_TOKEN) : (_req: any, _res: any, next: any) => next();

app.use('/api/plants', auth, plantRoutes);
app.use('/api/species', optionalAuth, speciesRoutes);
app.use('/api/users', auth, userRoutes);

// Test routes (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected');

    // Seed species data
    await seedSpecies();

    // Initialize Telegram bot
    if (BOT_TOKEN) {
      initBot(BOT_TOKEN, WEBAPP_URL);
    }

    // Start notification scheduler
    startScheduler();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      if (BOT_TOKEN) {
        console.log(`WebApp URL: ${WEBAPP_URL}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
