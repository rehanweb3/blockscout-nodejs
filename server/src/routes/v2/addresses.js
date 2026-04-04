import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { formatAddress, formatTransaction, formatBlock, paginate } from '../../utils/format.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

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
      name: row.name || null,
      symbol: row.symbol || null,
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

router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const cacheKey = `addr:${hash.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [addrResult, ttCountResult, tokenBalResult, tokenResult, scResult] = await Promise.all([
      query('SELECT * FROM addresses WHERE LOWER(hash) = LOWER($1)', [hash]),
      query(
        'SELECT COUNT(*) as count FROM token_transfers WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
      query('SELECT COUNT(*) as count FROM token_balances WHERE LOWER(address) = LOWER($1) AND balance > 0', [hash]),
      query('SELECT * FROM tokens WHERE LOWER(address) = LOWER($1)', [hash]),
      query('SELECT address, name FROM smart_contracts WHERE LOWER(address) = LOWER($1)', [hash]),
    ]);

    const addrRow = addrResult.rows[0] || { hash, balance: 0, nonce: 0, is_contract: false };
    if (scResult.rows.length > 0) {
      addrRow.is_verified = true;
      if (scResult.rows[0].name && !addrRow.name) {
        addrRow.name = scResult.rows[0].name;
      }
    }
    const hasTokenTransfers = parseInt(ttCountResult.rows[0]?.count || '0') > 0;
    const hasTokens = parseInt(tokenBalResult.rows[0]?.count || '0') > 0;
    const tokenRow = tokenResult.rows[0] || null;

    const formatted = formatAddress(addrRow);
    formatted.has_token_transfers = hasTokenTransfers;
    formatted.has_tokens = hasTokens;
    if (tokenRow) {
      formatted.token = {
        address_hash: tokenRow.address,
        name: tokenRow.name || null,
        symbol: tokenRow.symbol || null,
        decimals: tokenRow.decimals?.toString() || '18',
        type: tokenRow.token_type || 'ERC-20',
        icon_url: tokenRow.icon_url || null,
        exchange_rate: null,
        holders_count: tokenRow.holders_count?.toString() || '0',
        is_bridged: false,
        circulating_market_cap: null,
        total_supply: tokenRow.total_supply?.toString() || null,
      };
      formatted.is_contract = true;
    }

    await cacheSet(cacheKey, formatted, 30);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/transactions', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const { isBlacklisted } = await import('../../blacklist.js');
    if (isBlacklisted(hash)) {
      return res.json({ items: [], next_page_params: null });
    }

    const result = await query(
      `SELECT t.*,
        fa.name as from_name, fa.is_contract as from_is_contract, fa.is_verified as from_is_verified,
        ta.name as to_name, ta.is_contract as to_is_contract, ta.is_verified as to_is_verified
       FROM transactions t
       LEFT JOIN addresses fa ON LOWER(fa.hash) = LOWER(t.from_address)
       LEFT JOIN addresses ta ON LOWER(ta.hash) = LOWER(t.to_address)
       WHERE LOWER(t.from_address) = LOWER($1) OR LOWER(t.to_address) = LOWER($1)
       ORDER BY t.timestamp DESC, t.position ASC
       LIMIT $2`,
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTransaction);

    res.json(paginate(items, hasMore ? { items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/token-transfers', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const typeFilter = req.query.type;

    let where = 'WHERE (LOWER(tt.from_address) = LOWER($1) OR LOWER(tt.to_address) = LOWER($1))';
    const params = [hash];

    if (typeFilter) {
      params.push(typeFilter);
      where += ` AND tt.token_type = $${params.length}`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT tt.*, t.name, t.symbol, t.decimals, t.icon_url
       FROM token_transfers tt
       LEFT JOIN tokens t ON LOWER(tt.token_address) = LOWER(t.address)
       ${where}
       ORDER BY tt.block_number DESC, tt.log_index DESC
       LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatTokenTransfer);

    res.json(paginate(items, hasMore ? { block_number: Number(rows[limit - 1]?.block_number), items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/tokens', async (req, res) => {
  try {
    const { hash } = req.params;
    const typeParam = req.query.type;
    const types = typeParam
      ? String(typeParam).split(',').map((t) => t.trim()).filter(Boolean)
      : null;

    const params = [hash];
    let typeClause = '';
    if (types && types.length > 0) {
      params.push(types);
      typeClause = `AND COALESCE(t.token_type, 'ERC-20') = ANY($2::text[])`;
    }

    const result = await query(
      `SELECT tb.token_address, tb.balance, t.name, t.symbol, t.decimals, t.token_type, t.icon_url
       FROM token_balances tb
       LEFT JOIN tokens t ON LOWER(t.address) = LOWER(tb.token_address)
       WHERE LOWER(tb.address) = LOWER($1) AND tb.balance > 0 ${typeClause}
       ORDER BY tb.balance DESC
       LIMIT 50`,
      params,
    );

    const items = result.rows.map((row) => ({
      token: {
        address_hash: row.token_address,
        name: row.name || null,
        symbol: row.symbol || null,
        decimals: row.decimals?.toString() || '18',
        type: row.token_type || 'ERC-20',
        icon_url: row.icon_url || null,
        exchange_rate: null,
        holders_count: '0',
        is_bridged: false,
        circulating_market_cap: null,
      },
      value: row.balance?.toString() || '0',
      token_id: null,
    }));

    res.json({ items, next_page_params: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/internal-transactions', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    const result = await query(
      'SELECT * FROM internal_transactions WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1) ORDER BY timestamp DESC LIMIT $2',
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row) => ({
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
    }));

    res.json(paginate(items, hasMore ? { items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/logs', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    const result = await query(
      `SELECT l.*, a.is_contract, a.is_verified, a.name as addr_name
       FROM logs l
       LEFT JOIN addresses a ON a.hash = l.address
       WHERE LOWER(l.address) = LOWER($1)
       ORDER BY l.block_number DESC, l.log_index DESC
       LIMIT $2`,
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatLog);
    res.json(paginate(items, hasMore ? { block_number: items[items.length - 1]?.block_number, index: items[items.length - 1]?.index } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/blocks-validated', async (req, res) => {
  try {
    const { hash } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 50);

    const result = await query(
      'SELECT * FROM blocks WHERE LOWER(miner) = LOWER($1) ORDER BY number DESC LIMIT $2',
      [hash, limit + 1],
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatBlock);

    res.json(paginate(items, hasMore ? { items_count: limit } : null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/coin-balance-history', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/coin-balance-history-by-day', async (req, res) => {
  res.json([]);
});

router.get('/:hash/tabs-counters', async (req, res) => {
  try {
    const { hash } = req.params;
    const [txRes, blocksRes, ttRes, intlRes, tokenBalRes, logsRes] = await Promise.all([
      query(
        'SELECT COUNT(*) as count FROM transactions WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
      query('SELECT COUNT(*) as count FROM blocks WHERE LOWER(miner) = LOWER($1)', [hash]),
      query(
        'SELECT COUNT(*) as count FROM token_transfers WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
      query(
        'SELECT COUNT(*) as count FROM internal_transactions WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
      query(
        'SELECT COUNT(*) as count FROM token_balances WHERE LOWER(address) = LOWER($1) AND balance > 0',
        [hash],
      ),
      query(
        'SELECT COUNT(*) as count FROM logs WHERE LOWER(address) = LOWER($1)',
        [hash],
      ),
    ]);

    res.json({
      transactions_count: parseInt(txRes.rows[0].count),
      token_transfers_count: parseInt(ttRes.rows[0].count),
      token_balances_count: parseInt(tokenBalRes.rows[0].count),
      validations_count: parseInt(blocksRes.rows[0].count),
      logs_count: parseInt(logsRes.rows[0].count),
      withdrawals_count: 0,
      internal_transactions_count: parseInt(intlRes.rows[0].count),
      beacon_deposits_count: null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/counters', async (req, res) => {
  try {
    const { hash } = req.params;
    const [txRes, ttRes] = await Promise.all([
      query(
        'SELECT COUNT(*) as count FROM transactions WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
      query(
        'SELECT COUNT(*) as count FROM token_transfers WHERE LOWER(from_address) = LOWER($1) OR LOWER(to_address) = LOWER($1)',
        [hash],
      ),
    ]);
    res.json({
      transactions_count: txRes.rows[0].count,
      token_transfers_count: ttRes.rows[0].count,
      gas_usage_count: '0',
      validations_count: '0',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:hash/deposits', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/withdrawals', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/epoch-rewards', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/nft', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

router.get('/:hash/nft-holdings', async (req, res) => {
  res.json({ items: [], next_page_params: null });
});

export default router;
