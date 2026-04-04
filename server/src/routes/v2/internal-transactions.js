import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';
import { paginate } from '../../utils/format.js';

const router = Router();

function formatInternalTx(row) {
  return {
    block_number: Number(row.block_number),
    created_contract: null,
    error: row.error || null,
    from: { hash: row.from_address || '0x0000000000000000000000000000000000000000' },
    gas_limit: row.gas?.toString() || '0',
    index: Number(row.index || 0),
    success: row.success !== false,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    to: row.to_address ? { hash: row.to_address } : null,
    transaction_hash: row.transaction_hash,
    type: row.type || 'call',
    value: row.value?.toString() || '0',
  };
}

// GET /api/v2/internal-transactions — paginated list
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const before = req.query.block_number_lt ? Number(req.query.block_number_lt) : null;
    const txFilter = req.query.transaction_hash || null;

    const cacheKey = `internal_txs:${limit}:${before}:${txFilter}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const params = [];
    let where = 'WHERE 1=1';

    if (before !== null) {
      params.push(before);
      where += ` AND block_number < $${params.length}`;
    }

    if (txFilter) {
      params.push(txFilter);
      where += ` AND transaction_hash = $${params.length}`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT * FROM internal_transactions ${where} ORDER BY timestamp DESC, id DESC LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatInternalTx);
    const lastItem = items[items.length - 1];

    const out = paginate(items, hasMore && lastItem ? {
      block_number: lastItem.block_number,
      items_count: limit,
      transaction_hash: lastItem.transaction_hash,
    } : null);

    await cacheSet(cacheKey, out, 10);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
