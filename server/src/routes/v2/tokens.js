import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { paginate } from '../../utils/format.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

const router = Router();

function formatToken(row) {
  return {
    address_hash: row.address,
    name: row.name || null,
    symbol: row.symbol || null,
    decimals: row.decimals?.toString() || '18',
    total_supply: row.total_supply?.toString() || null,
    type: row.token_type || 'ERC-20',
    holders_count: row.holders_count?.toString() || '0',
    exchange_rate: null,
    icon_url: row.icon_url || null,
    circulating_market_cap: null,
    reputation: null,
    is_bridged: false,
  };
}

function formatTransfer(row) {
  const isNFT = row.token_type === 'ERC-721' || row.token_type === 'ERC-1155';
  const total = isNFT
    ? { token_id: row.token_id?.toString() || null, token_instance: null }
    : { decimals: row.decimals?.toString() || '18', value: row.amount?.toString() || '0' };

  return {
    transaction_hash: row.transaction_hash,
    block_hash: null,
    block_number: String(row.block_number),
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : (row.timestamp || null),
    log_index: String(row.log_index ?? 0),
    from: { hash: row.from_address || '0x0000000000000000000000000000000000000000' },
    to: { hash: row.to_address || '0x0000000000000000000000000000000000000000' },
    token: {
      address_hash: row.token_address || '0x0000000000000000000000000000000000000000',
      type: row.token_type || 'ERC-20',
      symbol: row.symbol || null,
      name: row.name || null,
      decimals: row.decimals?.toString() || '18',
      icon_url: row.icon_url || null,
      exchange_rate: null,
      holders_count: '0',
      is_bridged: false,
      circulating_market_cap: null,
    },
    total,
    type: 'token_transfer',
    method: 'transfer',
  };
}

function formatHolder(row) {
  return {
    address: { hash: row.address },
    value: row.balance?.toString() || '0',
    token_id: null,
    items_count: null,
  };
}

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const type = req.query.type;
    const q = req.query.q;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (type) {
      params.push(type);
      whereClause += ` AND token_type = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      whereClause += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(symbol) LIKE LOWER($${params.length}) OR LOWER(address) LIKE LOWER($${params.length}))`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT * FROM tokens ${whereClause} ORDER BY transfer_count DESC LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatToken);

    res.json(paginate(items, hasMore ? { items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tokens WHERE LOWER(address) = LOWER($1)',
      [req.params.hash],
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Token not found' });
    res.json(formatToken(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/transfers', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    const result = await query(
      `SELECT tt.*, t.symbol, t.name, t.decimals, t.icon_url
       FROM token_transfers tt
       LEFT JOIN tokens t ON t.address = tt.token_address
       WHERE LOWER(tt.token_address) = LOWER($1)
       ORDER BY tt.block_number DESC, tt.log_index DESC
       LIMIT $2`,
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTransfer);

    res.json(paginate(items, hasMore ? { block_number: rows[limit - 1]?.block_number } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/holders', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    const result = await query(
      `SELECT address, balance FROM token_balances
       WHERE LOWER(token_address) = LOWER($1) AND balance > 0
       ORDER BY balance DESC
       LIMIT $2`,
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatHolder);

    res.json(paginate(items, hasMore ? { items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/counters', async (req, res) => {
  try {
    const { hash } = req.params;
    const cacheKey = `token_counters:${hash.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(
      'SELECT transfer_count, holders_count FROM tokens WHERE LOWER(address) = LOWER($1)',
      [hash],
    );

    const row = result.rows[0];
    const data = {
      token_holders_count: row?.holders_count?.toString() || '0',
      transfers_count: row?.transfer_count?.toString() || '0',
    };

    await cacheSet(cacheKey, data, 60);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/instances', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/instances/:id', async (req, res) => {
  res.status(404).json({ message: 'Token instance not found' });
});

router.get('/:hash/instances/:id/transfers', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

export default router;
