import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { formatTransaction, paginate } from '../../utils/format.js';
import { cacheGet, cacheSet } from '../../db/redis.js';
import { blacklistWhereClause, isBlacklisted } from '../../blacklist.js';

const router = Router();

function formatLog(row) {
  const topics = [row.topic0, row.topic1, row.topic2, row.topic3].filter(Boolean);
  return {
    address: {
      hash: row.address || '0x0000000000000000000000000000000000000000',
      name: row.addr_name || null,
      is_contract: row.is_contract || false,
      is_verified: row.is_verified || false,
      ens_domain_name: null,
    },
    block_number: Number(row.block_number),
    data: row.data || '0x',
    decoded: null,
    index: Number(row.log_index),
    smart_contract: null,
    topics,
    transaction_hash: row.transaction_hash,
  };
}

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
      icon_url: null,
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

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const filter = req.query.filter;
    const beforeBlock = req.query.block_number_lt ? Number(req.query.block_number_lt) : null;

    const cacheKey = `txs:${filter || 'all'}:${beforeBlock || ''}:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filter === 'pending') {
      whereClause += ' AND t.status IS NULL AND t.block_number IS NULL';
    } else {
      whereClause += ' AND t.block_number IS NOT NULL';
    }

    if (beforeBlock !== null) {
      params.push(beforeBlock);
      whereClause += ` AND t.block_number < $${params.length}`;
    }

    const blFilter = blacklistWhereClause('t.from_address', 't.to_address', params.length + 1);
    if (blFilter.clause) {
      whereClause += blFilter.clause;
      params.push(...blFilter.params);
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT t.*,
        fa.name as from_name, fa.is_contract as from_is_contract, fa.is_verified as from_is_verified,
        ta.name as to_name, ta.is_contract as to_is_contract, ta.is_verified as to_is_verified
       FROM transactions t
       LEFT JOIN addresses fa ON LOWER(fa.hash) = LOWER(t.from_address)
       LEFT JOIN addresses ta ON LOWER(ta.hash) = LOWER(t.to_address)
       ${whereClause} ORDER BY t.timestamp DESC, t.position ASC LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTransaction);
    const lastItem = items[items.length - 1];

    const out = paginate(items, hasMore && lastItem ? {
      block_number: lastItem.block_number,
      inserted_at: lastItem.timestamp,
      hash: lastItem.hash,
      index: lastItem.position,
      items_count: limit,
    } : null);

    await cacheSet(cacheKey, out, 10);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const cacheKey = `tx:${hash}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(
      `SELECT t.*,
        fa.name as from_name, fa.is_contract as from_is_contract, fa.is_verified as from_is_verified,
        ta.name as to_name, ta.is_contract as to_is_contract, ta.is_verified as to_is_verified,
        sc.name as contract_name, (sc.verified_at IS NOT NULL) as contract_is_verified
       FROM transactions t
       LEFT JOIN addresses fa ON LOWER(fa.hash) = LOWER(t.from_address)
       LEFT JOIN addresses ta ON LOWER(ta.hash) = LOWER(t.to_address)
       LEFT JOIN smart_contracts sc ON LOWER(sc.address) = LOWER(t.creates)
       WHERE t.hash = $1`,
      [hash],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const row = result.rows[0];
    if (isBlacklisted(row.from_address) || isBlacklisted(row.to_address)) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const formatted = formatTransaction(row);
    await cacheSet(cacheKey, formatted, 30);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/token-transfers', async (req, res) => {
  try {
    const result = await query(
      `SELECT tt.*, t.name as token_name, t.symbol as token_symbol, t.decimals
       FROM token_transfers tt
       LEFT JOIN tokens t ON LOWER(tt.token_address) = LOWER(t.address)
       WHERE tt.transaction_hash = $1
       ORDER BY tt.log_index ASC`,
      [req.params.hash],
    );
    res.json({ items: result.rows.map(formatTokenTransfer), next_page_params: null });
  } catch (err) {
    res.json({ items: [], next_page_params: null });
  }
});

router.get('/:hash/internal-transactions', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM internal_transactions WHERE transaction_hash = $1 ORDER BY index ASC',
      [req.params.hash],
    );
    res.json({ items: result.rows.map(formatInternalTx), next_page_params: null });
  } catch (err) {
    res.json({ items: [], next_page_params: null });
  }
});

router.get('/:hash/logs', async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await query(
      `SELECT l.*, a.is_contract, a.is_verified, a.name as addr_name
       FROM logs l
       LEFT JOIN addresses a ON a.hash = l.address
       WHERE LOWER(l.transaction_hash) = LOWER($1)
       ORDER BY l.log_index ASC`,
      [hash],
    );

    const items = result.rows.map((row) => formatLog(row));
    res.json({ items, next_page_params: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/state-changes', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/raw-trace', async (req, res) => {
  try {
    const result = await query(
      'SELECT trace FROM transaction_traces WHERE transaction_hash = $1',
      [req.params.hash.toLowerCase()],
    );
    if (result.rows.length && result.rows[0].trace) {
      const trace = result.rows[0].trace;
      res.json([typeof trace === 'string' ? JSON.parse(trace) : trace]);
    } else {
      res.json([]);
    }
  } catch {
    res.json([]);
  }
});

router.get('/:hash/summary', async (req, res) => {
  res.json({ data: { summaries: [] } });
});

export default router;
