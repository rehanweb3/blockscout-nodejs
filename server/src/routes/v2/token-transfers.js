import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';
import { paginate } from '../../utils/format.js';

const router = Router();

function formatTokenTransfer(row) {
  const isNFT = row.token_type === 'ERC-721' || row.token_type === 'ERC-1155';
  const total = isNFT
    ? { token_id: row.token_id?.toString() || null, token_instance: null }
    : { decimals: row.decimals?.toString() || '18', value: row.amount?.toString() || '0' };

  return {
    block_hash: null,
    block_number: String(row.block_number),
    from: { hash: row.from_address || '0x0000000000000000000000000000000000000000' },
    log_index: String(row.log_index ?? 0),
    method: 'transfer',
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : (row.timestamp || null),
    to: { hash: row.to_address || '0x0000000000000000000000000000000000000000' },
    token: {
      address_hash: row.token_address || '0x0000000000000000000000000000000000000000',
      decimals: row.decimals?.toString() || '18',
      exchange_rate: null,
      icon_url: row.icon_url || null,
      name: row.token_name || null,
      symbol: row.token_symbol || null,
      type: row.token_type || 'ERC-20',
      holders_count: '0',
      is_bridged: false,
      circulating_market_cap: null,
    },
    total,
    transaction_hash: row.transaction_hash,
    type: 'token_transfer',
  };
}

// GET /api/v2/token-transfers
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const tokenFilter = req.query.token_contract_address_hash || null;
    const typeFilter = req.query.type || null;
    const beforeBlock = req.query.block_number_lt ? Number(req.query.block_number_lt) : null;

    const cacheKey = `token_transfers:${limit}:${beforeBlock}:${tokenFilter}:${typeFilter}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const params = [];
    let where = 'WHERE 1=1';

    if (tokenFilter) {
      params.push(tokenFilter.toLowerCase());
      where += ` AND LOWER(tt.token_address) = $${params.length}`;
    }

    if (typeFilter) {
      params.push(typeFilter);
      where += ` AND tt.token_type = $${params.length}`;
    }

    if (beforeBlock !== null) {
      params.push(beforeBlock);
      where += ` AND tt.block_number < $${params.length}`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT tt.*, t.name as token_name, t.symbol as token_symbol, t.decimals
       FROM token_transfers tt
       LEFT JOIN tokens t ON LOWER(tt.token_address) = LOWER(t.address)
       ${where}
       ORDER BY tt.timestamp DESC, tt.id DESC
       LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTokenTransfer);
    const lastItem = items[items.length - 1];

    const out = paginate(items, hasMore && lastItem ? {
      block_number: Number(lastItem.block_number),
      items_count: limit,
    } : null);

    await cacheSet(cacheKey, out, 10);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
