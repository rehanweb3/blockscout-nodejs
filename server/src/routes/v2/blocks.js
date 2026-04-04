import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { formatBlock, formatTransaction, paginate } from '../../utils/format.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const beforeBlock = req.query.block_number_lt ? Number(req.query.block_number_lt) : null;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (beforeBlock !== null) {
      params.push(beforeBlock);
      whereClause += ` AND number < $${params.length}`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT * FROM blocks ${whereClause} ORDER BY number DESC LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatBlock);
    const lastItem = items[items.length - 1];

    res.json(paginate(items, hasMore && lastItem ? {
      block_number: lastItem.height,
      items_count: limit,
    } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hashOrNumber', async (req, res) => {
  try {
    const { hashOrNumber } = req.params;
    const cacheKey = `block:${hashOrNumber}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let result;
    if (hashOrNumber.startsWith('0x')) {
      result = await query('SELECT * FROM blocks WHERE hash = $1', [hashOrNumber]);
    } else {
      result = await query('SELECT * FROM blocks WHERE number = $1', [Number(hashOrNumber)]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Block not found' });
    }

    const formatted = formatBlock(result.rows[0]);
    await cacheSet(cacheKey, formatted, 60);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hashOrNumber/transactions', async (req, res) => {
  try {
    const { hashOrNumber } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    let blockNumber;
    if (hashOrNumber.startsWith('0x')) {
      const blk = await query('SELECT number FROM blocks WHERE hash = $1', [hashOrNumber]);
      if (!blk.rows.length) return res.status(404).json({ message: 'Block not found' });
      blockNumber = blk.rows[0].number;
    } else {
      blockNumber = Number(hashOrNumber);
    }

    const result = await query(
      'SELECT * FROM transactions WHERE block_number = $1 ORDER BY position ASC LIMIT $2',
      [blockNumber, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTransaction);

    res.json(paginate(items, hasMore ? { block_number: blockNumber, items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
