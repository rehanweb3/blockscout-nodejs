import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { initSchema, testConnection } from './db/postgres.js';
import { getRedis } from './db/redis.js';
import { connectMongo } from './db/mongo.js';
import { startIndexer } from './indexer/index.js';
import { logger } from './utils/logger.js';

import statsRouter from './routes/v2/stats.js';
import blocksRouter from './routes/v2/blocks.js';
import transactionsRouter from './routes/v2/transactions.js';
import addressesRouter from './routes/v2/addresses.js';
import addressesListRouter from './routes/v2/addresses-list.js';
import searchRouter from './routes/v2/search.js';
import tokensRouter from './routes/v2/tokens.js';
import chartsRouter from './routes/v2/charts.js';
import indexingStatusRouter from './routes/v2/indexing-status.js';
import configRouter from './routes/v2/config.js';
import smartContractsRouter from './routes/v2/smart-contracts.js';
import internalTransactionsRouter from './routes/v2/internal-transactions.js';
import tokenTransfersRouter from './routes/v2/token-transfers.js';
import gasTrackerRouter from './routes/v2/gas-tracker.js';
import adminRouter from './routes/admin.js';
import { isBlacklisted, getBlacklist } from './blacklist.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/admin', adminRouter);

const API = '/api/v2';
app.use(`${API}/stats`, statsRouter);
app.use(`${API}/blocks`, blocksRouter);
app.use(`${API}/transactions`, transactionsRouter);
app.use(`${API}/addresses`, addressesRouter);
app.use(`${API}/addresses`, addressesListRouter);
app.use(`${API}/search`, searchRouter);
app.use(`${API}/tokens`, tokensRouter);
app.use(`${API}/stats/charts`, chartsRouter);
app.use(`${API}/main-page/indexing-status`, indexingStatusRouter);
app.use(`${API}/config`, configRouter);
app.use(`${API}/smart-contracts`, smartContractsRouter);
app.use(`${API}/internal-transactions`, internalTransactionsRouter);
app.use(`${API}/token-transfers`, tokenTransfersRouter);
app.use(`${API}/gas-tracker`, gasTrackerRouter);

app.use(`${API}/main-page/blocks`, async (req, res) => {
  try {
    const { query } = await import('./db/postgres.js');
    const { formatBlock } = await import('./utils/format.js');
    const { cacheGet, cacheSet } = await import('./db/redis.js');
    const cached = await cacheGet('main_page_blocks');
    if (cached) return res.json(cached);
    const result = await query('SELECT * FROM blocks ORDER BY number DESC LIMIT 6');
    const data = result.rows.map(formatBlock);
    await cacheSet('main_page_blocks', data, 5);
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

app.use(`${API}/main-page/transactions`, async (req, res) => {
  try {
    const { query } = await import('./db/postgres.js');
    const { formatTransaction } = await import('./utils/format.js');
    const { cacheGet, cacheSet } = await import('./db/redis.js');
    const bl = getBlacklist();
    if (bl.length === 0) {
      const cached = await cacheGet('main_page_txs');
      if (cached) return res.json(cached);
    }
    let sql = 'SELECT * FROM transactions WHERE block_number IS NOT NULL';
    const params = [];
    if (bl.length > 0) {
      const ph = bl.map((_, i) => `$${i + 1}`).join(', ');
      sql += ` AND LOWER(from_address) NOT IN (${ph}) AND LOWER(to_address) NOT IN (${ph})`;
      params.push(...bl);
    }
    sql += ' ORDER BY timestamp DESC LIMIT 6';
    const result = await query(sql, params);
    const data = result.rows.map(formatTransaction);
    if (bl.length === 0) await cacheSet('main_page_txs', data, 5);
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function main() {
  logger.info('Starting Blockscout backend server...');

  getRedis();

  const pgOk = await testConnection().catch(() => false);
  if (pgOk) {
    logger.info('PostgreSQL connected');
    await initSchema();
  } else {
    logger.warn('PostgreSQL unavailable — API will return empty data');
  }

  await connectMongo();

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`API server running on port ${PORT}`);
  });

  if (pgOk && process.env.ENABLE_INDEXER !== 'false') {
    startIndexer().catch((err) => logger.error('Indexer error:', err));
  }
}

main().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
