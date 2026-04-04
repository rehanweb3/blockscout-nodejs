import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

const router = Router();

router.get('/market', async (req, res) => {
  res.json({
    available_supply: null,
    coin_usd_price: null,
    market_cap: null,
    prices: [],
    prices_date: [],
  });
});

router.get('/transactions', async (req, res) => {
  try {
    const cacheKey = 'chart:transactions';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM transactions
      WHERE timestamp > NOW() - INTERVAL '30 days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `);

    const chart = result.rows.map((row) => ({
      date: row.date,
      transactions_count: Number(row.count),
    }));

    const out = { chart_data: chart };
    await cacheSet(cacheKey, out, 300);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/blocks', async (req, res) => {
  try {
    const cacheKey = 'chart:blocks';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count,
        AVG(gas_used) as avg_gas_used,
        AVG(gas_limit) as avg_gas_limit
      FROM blocks
      WHERE timestamp > NOW() - INTERVAL '30 days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `);

    const chart = result.rows.map((row) => ({
      date: row.date,
      block_count: Number(row.count),
      avg_gas_used: row.avg_gas_used ? Math.round(Number(row.avg_gas_used)) : 0,
      avg_gas_limit: row.avg_gas_limit ? Math.round(Number(row.avg_gas_limit)) : 0,
    }));

    const out = { chart_data: chart };
    await cacheSet(cacheKey, out, 300);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/gas', async (req, res) => {
  try {
    const cacheKey = 'chart:gas';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(`
      SELECT
        DATE(timestamp) as date,
        AVG(gas_price) / 1e9 as avg_gas_price_gwei
      FROM transactions
      WHERE timestamp > NOW() - INTERVAL '30 days'
        AND gas_price > 0
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `);

    const chart = result.rows.map((row) => ({
      date: row.date,
      gas_price_gwei: row.avg_gas_price_gwei ? parseFloat(Number(row.avg_gas_price_gwei).toFixed(2)) : 0,
    }));

    const out = { chart_data: chart };
    await cacheSet(cacheKey, out, 300);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
