import express from 'express';
import dotenv from 'dotenv';
import apiRouter from '../server/routes/apiRoutes.ts';
import { db } from '../server/db/store.ts';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isDbInitialized = false;
const ensureDb = async () => {
  if (!isDbInitialized) {
    try {
      await db.init();
      isDbInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }
};

// Initialize DB before handling API requests
app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    app: 'AutoApex Automotive E-Commerce API',
    runtime: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

// Mount router on /api and root fallback
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
