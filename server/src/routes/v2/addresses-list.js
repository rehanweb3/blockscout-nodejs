import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';
import { formatAddress, paginate } from '../../utils/format.js';

const router = Router();

// GET /api/v2/addresses — top accounts sorted by balance
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const afterRank = req.query.fetched_coin_balance_lt
      ? Number(req.query.fetched_coin_balance_lt)
      : null;

    const cacheKey = `addresses:top:${limit}:${afterRank}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const params = [];
    let where = 'WHERE balance > 0';

    if (afterRank !== null) {
      params.push(afterRank);
      where += ` AND balance < $${params.length}`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT *, tx_count FROM addresses ${where} ORDER BY balance DESC NULLS LAST LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row, idx) => ({
      ...formatAddress(row),
      transactions_count: Number(row.tx_count || 0),
    }));

    const lastItem = rows[Math.min(limit - 1, rows.length - 1)];
    const out = paginate(items, hasMore && lastItem ? {
      fetched_coin_balance: lastItem.balance?.toString() || '0',
      hash: lastItem.hash,
      items_count: limit,
    } : null);

    await cacheSet(cacheKey, out, 20);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
