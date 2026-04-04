import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

const router = Router();

// GET /api/v2/gas-tracker
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'gas_tracker';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [recentGasRes, latestBlockRes] = await Promise.all([
      query(`
        SELECT
          PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY gas_price) AS p10,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gas_price) AS p50,
          PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY gas_price) AS p90,
          AVG(gas_price) AS avg,
          MIN(gas_price) AS min_price,
          MAX(gas_price) AS max_price
        FROM transactions
        WHERE timestamp > NOW() - INTERVAL '10 minutes'
          AND gas_price > 0
          AND status = 1
      `),
      query(`SELECT gas_used, gas_limit, base_fee_per_gas FROM blocks ORDER BY number DESC LIMIT 1`),
    ]);

    const gasRow = recentGasRes.rows[0];
    const block = latestBlockRes.rows[0];

    const toGwei = (val) => val ? Math.max(1, Math.round(Number(val) / 1e9)) : 1;
    const baseFee = block?.base_fee_per_gas ? Math.round(Number(block.base_fee_per_gas) / 1e9) : 0;
    const slow = toGwei(gasRow?.p10) || Math.max(1, baseFee);
    const average = toGwei(gasRow?.p50) || Math.max(1, baseFee + 1);
    const fast = toGwei(gasRow?.p90) || Math.max(1, baseFee + 2);

    const result = {
      slow: {
        base_fee: baseFee,
        max_priority_fee_per_gas: Math.max(0, slow - baseFee),
        max_fee_per_gas: slow,
        price: slow,
        time: null,
        fiat_price: null,
      },
      average: {
        base_fee: baseFee,
        max_priority_fee_per_gas: Math.max(0, average - baseFee),
        max_fee_per_gas: average,
        price: average,
        time: null,
        fiat_price: null,
      },
      fast: {
        base_fee: baseFee,
        max_priority_fee_per_gas: Math.max(0, fast - baseFee),
        max_fee_per_gas: fast,
        price: fast,
        time: null,
        fiat_price: null,
      },
    };

    await cacheSet(cacheKey, result, 15);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
