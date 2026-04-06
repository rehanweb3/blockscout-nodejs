import { Router } from 'express';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet } from '../../db/redis.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'stats:home';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [blocksRes, txRes, addrRes, latestBlockRes, gasRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM blocks'),
      query('SELECT COUNT(*) as count FROM transactions'),
      query('SELECT COUNT(*) as count FROM addresses'),
      query('SELECT number, timestamp, base_fee_per_gas, gas_used, gas_limit FROM blocks ORDER BY number DESC LIMIT 2'),
      query(`
        SELECT AVG(gas_price) as avg_gas
        FROM transactions
        WHERE timestamp > NOW() - INTERVAL '1 hour'
          AND gas_price > 0
      `),
    ]);

    const latest = latestBlockRes.rows[0];
    const prev = latestBlockRes.rows[1];
    let avgBlockTime = 12000;
    if (latest && prev) {
      const diff = new Date(latest.timestamp) - new Date(prev.timestamp);
      if (diff > 0) avgBlockTime = diff;
    }

    const gasPrice = gasRes.rows[0]?.avg_gas
      ? Math.round(Number(gasRes.rows[0].avg_gas) / 1e9)
      : 20;

    const stats = {
      total_blocks: blocksRes.rows[0].count,
      total_addresses: addrRes.rows[0].count,
      total_transactions: txRes.rows[0].count,
      average_block_time: avgBlockTime,
      coin_price: null,
      coin_price_change_percentage: null,
      total_gas_used: latest?.gas_used?.toString() || '0',
      transactions_today: null,
      gas_used_today: '0',
      gas_prices: {
        average: { price: gasPrice, fiat_price: null, time: null, base_fee: null, priority_fee: null },
        fast: { price: Math.round(gasPrice * 1.5), fiat_price: null, time: null, base_fee: null, priority_fee: null },
        slow: { price: Math.round(gasPrice * 0.7), fiat_price: null, time: null, base_fee: null, priority_fee: null },
      },
      gas_price_updated_at: new Date().toISOString(),
      gas_prices_update_in: 30000,
      static_gas_price: null,
      market_cap: null,
      network_utilization_percentage: latest
        ? (Number(latest.gas_used) / Number(latest.gas_limit)) * 100
        : 0,
      tvl: null,
      coin_image: '/native.png',
    };

    await cacheSet(cacheKey, stats, 15);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/counters', async (req, res) => {
  try {
    const cacheKey = 'stats:counters';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [blocksRes, txRes, addrRes, contractsRes, latestBlockRes, gasRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM blocks'),
      query('SELECT COUNT(*) as count FROM transactions'),
      query('SELECT COUNT(*) as count FROM addresses'),
      query('SELECT COUNT(*) as count FROM smart_contracts'),
      query('SELECT AVG(EXTRACT(EPOCH FROM (b1.timestamp - b2.timestamp))) as avg_time FROM blocks b1 JOIN blocks b2 ON b1.number = b2.number + 1 LIMIT 1000'),
      query('SELECT AVG(gas_price) as avg_gas, SUM(gas_used) as total_gas FROM transactions'),
    ]);

    const avgBlockTimeSec = latestBlockRes.rows[0]?.avg_time
      ? Number(latestBlockRes.rows[0].avg_time).toFixed(1)
      : '5.0';

    const result = {
      counters: [
        { id: 'totalBlocks', title: 'Total blocks', value: blocksRes.rows[0].count, units: null, description: 'Total number of blocks indexed' },
        { id: 'totalTransactions', title: 'Total transactions', value: txRes.rows[0].count, units: null, description: 'Total number of transactions indexed' },
        { id: 'walletAddresses', title: 'Wallet addresses', value: addrRes.rows[0].count, units: null, description: 'Total number of unique addresses' },
        { id: 'verifiedContracts', title: 'Verified contracts', value: contractsRes.rows[0].count, units: null, description: 'Total number of verified contracts' },
        { id: 'averageBlockTime', title: 'Average block time', value: avgBlockTimeSec, units: 's', description: 'Average time between blocks' },
        { id: 'gasUsedTotal', title: 'Gas used total', value: gasRes.rows[0]?.total_gas?.toString() || '0', units: null, description: 'Total gas used by all transactions' },
      ],
    };

    await cacheSet(cacheKey, result, 60);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const CHART_SECTIONS = [
  {
    id: 'transactions',
    title: 'Transactions',
    charts: [
      { id: 'txns_count', title: 'Daily transactions', description: 'Number of transactions per day', units: null },
      { id: 'average_txn_fee', title: 'Average transaction fee', description: 'Average transaction fee in native tokens per day', units: 'ATH' },
    ],
  },
  {
    id: 'blocks',
    title: 'Blocks',
    charts: [
      { id: 'new_blocks', title: 'New blocks', description: 'Number of blocks produced per day', units: null },
      { id: 'average_block_time', title: 'Average block time', description: 'Average time between consecutive blocks', units: 's' },
    ],
  },
  {
    id: 'gas',
    title: 'Gas',
    charts: [
      { id: 'average_gas_price', title: 'Average gas price', description: 'Average gas price paid per day', units: 'Gwei' },
      { id: 'network_utilization_percentage', title: 'Network utilization', description: 'Average network utilization percentage per day', units: '%' },
    ],
  },
];

router.get('/lines', async (req, res) => {
  res.json({ sections: CHART_SECTIONS });
});

router.get('/lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    const cacheKey = `stats:line:${id}:${from || ''}:${to || ''}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const section = CHART_SECTIONS.flatMap((s) => s.charts).find((c) => c.id === id);
    if (!section) return res.status(404).json({ message: 'Chart not found' });

    let sqlQuery;
    let transform;

    const dateFilter = `WHERE DATE(timestamp) >= COALESCE($1::date, NOW() - INTERVAL '30 days')
      AND DATE(timestamp) <= COALESCE($2::date, NOW())`;

    if (id === 'txns_count') {
      sqlQuery = `SELECT DATE(timestamp) as day, COUNT(*) as val FROM transactions ${dateFilter} GROUP BY day ORDER BY day ASC`;
      transform = (row) => String(Number(row.val));
    } else if (id === 'average_txn_fee') {
      sqlQuery = `SELECT DATE(timestamp) as day, AVG(gas_used::numeric * gas_price::numeric) / 1e18 as val FROM transactions ${dateFilter} GROUP BY day ORDER BY day ASC`;
      transform = (row) => parseFloat(Number(row.val || 0).toFixed(6)).toString();
    } else if (id === 'new_blocks') {
      sqlQuery = `SELECT DATE(timestamp) as day, COUNT(*) as val FROM blocks ${dateFilter} GROUP BY day ORDER BY day ASC`;
      transform = (row) => String(Number(row.val));
    } else if (id === 'average_block_time') {
      sqlQuery = `SELECT DATE(b1.timestamp) as day, AVG(EXTRACT(EPOCH FROM (b1.timestamp - b2.timestamp))) as val
        FROM blocks b1 JOIN blocks b2 ON b1.number = b2.number + 1
        WHERE DATE(b1.timestamp) >= COALESCE($1::date, NOW() - INTERVAL '30 days')
          AND DATE(b1.timestamp) <= COALESCE($2::date, NOW())
        GROUP BY day ORDER BY day ASC`;
      transform = (row) => parseFloat(Number(row.val || 0).toFixed(2)).toString();
    } else if (id === 'average_gas_price') {
      sqlQuery = `SELECT DATE(timestamp) as day, AVG(gas_price::numeric) / 1e9 as val FROM transactions ${dateFilter} AND gas_price::numeric > 0 GROUP BY day ORDER BY day ASC`;
      transform = (row) => parseFloat(Number(row.val || 0).toFixed(4)).toString();
    } else if (id === 'network_utilization_percentage') {
      sqlQuery = `SELECT DATE(timestamp) as day, AVG(CASE WHEN gas_limit > 0 THEN gas_used::numeric / gas_limit::numeric * 100 ELSE 0 END) as val FROM blocks ${dateFilter} GROUP BY day ORDER BY day ASC`;
      transform = (row) => parseFloat(Number(row.val || 0).toFixed(2)).toString();
    } else {
      return res.status(404).json({ message: 'Chart not found' });
    }

    const result = await query(sqlQuery, [ from || null, to || null ]);

    const chart = result.rows.map((row) => {
      const dateStr = row.day instanceof Date ? row.day.toISOString().split('T')[0] : String(row.day).split('T')[0];
      return {
        date: dateStr,
        date_to: dateStr,
        value: transform(row),
        is_approximate: false,
      };
    });

    const out = {
      info: { id: section.id, title: section.title, description: section.description, units: section.units, resolutions: [ 'DAY', 'WEEK', 'MONTH', 'YEAR' ] },
      chart,
    };

    await cacheSet(cacheKey, out, 300);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
