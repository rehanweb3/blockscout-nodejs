import { Router } from 'express';
import { query } from '../../db/postgres.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ items: [], next_page_params: null });

    const results = [];

    if (q.startsWith('0x') && q.length === 66) {
      const [txRes, blockRes] = await Promise.all([
        query('SELECT hash FROM transactions WHERE LOWER(hash) = LOWER($1)', [q]),
        query('SELECT number, hash FROM blocks WHERE LOWER(hash) = LOWER($1)', [q]),
      ]);

      if (txRes.rows.length) {
        results.push({
          type: 'transaction',
          transaction_hash: txRes.rows[0].hash,
          url: `/tx/${txRes.rows[0].hash}`,
          timestamp: null,
        });
      }
      if (blockRes.rows.length) {
        results.push({
          type: 'block',
          block_number: Number(blockRes.rows[0].number),
          block_hash: blockRes.rows[0].hash,
          url: `/block/${blockRes.rows[0].hash}`,
          timestamp: null,
        });
      }
    } else if (q.startsWith('0x') && q.length === 42) {
      const [addrRes, tokenRes] = await Promise.all([
        query('SELECT * FROM addresses WHERE LOWER(hash) = LOWER($1)', [q]),
        query('SELECT * FROM tokens WHERE LOWER(address) = LOWER($1)', [q]),
      ]);

      const addrRow = addrRes.rows[0];
      const tokenRow = tokenRes.rows[0];

      if (tokenRow) {
        results.push({
          type: 'token',
          address: tokenRow.address,
          address_hash: tokenRow.address,
          name: tokenRow.name || null,
          symbol: tokenRow.symbol || null,
          token_type: tokenRow.token_type || 'ERC-20',
          is_smart_contract_verified: Boolean(addrRow?.is_verified),
          is_smart_contract_address: true,
          is_verified_via_admin_panel: false,
          certified: false,
          icon_url: tokenRow.icon_url || null,
          exchange_rate: null,
          total_supply: tokenRow.total_supply?.toString() || null,
          token_url: `/token/${tokenRow.address}`,
          address_url: `/address/${tokenRow.address}`,
          reputation: null,
        });
      }

      results.push({
        type: addrRow?.is_contract || tokenRow ? 'contract' : 'address',
        address: q,
        address_hash: q,
        name: addrRow?.name || null,
        url: `/address/${q}`,
        is_smart_contract_verified: Boolean(addrRow?.is_verified),
        is_smart_contract_address: Boolean(addrRow?.is_contract) || Boolean(tokenRow),
        certified: false,
        ens_info: null,
      });
    } else if (/^\d+$/.test(q)) {
      const blockRes = await query('SELECT * FROM blocks WHERE number = $1', [Number(q)]);
      if (blockRes.rows.length) {
        results.push({
          type: 'block',
          block_number: Number(blockRes.rows[0].number),
          block_hash: blockRes.rows[0].hash,
          url: `/block/${blockRes.rows[0].number}`,
          timestamp: blockRes.rows[0].timestamp,
        });
      }
    } else {
      const tokenRes = await query(
        `SELECT * FROM tokens WHERE LOWER(name) LIKE LOWER($1) OR LOWER(symbol) LIKE LOWER($1) LIMIT 10`,
        [`%${q}%`],
      );
      for (const row of tokenRes.rows) {
        results.push({
          type: 'token',
          address: row.address,
          address_hash: row.address,
          name: row.name || null,
          symbol: row.symbol || null,
          token_type: row.token_type || 'ERC-20',
          is_smart_contract_verified: Boolean(row.is_verified),
          is_smart_contract_address: true,
          is_verified_via_admin_panel: false,
          certified: false,
          icon_url: row.icon_url || null,
          exchange_rate: null,
          total_supply: row.total_supply?.toString() || null,
          token_url: `/token/${row.address}`,
          address_url: `/address/${row.address}`,
          reputation: null,
        });
      }

      // Also search addresses/contracts by name
      const addrNameRes = await query(
        `SELECT a.*, sc.name as sc_name FROM addresses a
         LEFT JOIN smart_contracts sc ON LOWER(sc.address) = LOWER(a.hash)
         WHERE LOWER(COALESCE(a.name, sc.name)) LIKE LOWER($1) LIMIT 5`,
        [`%${q}%`],
      );
      for (const row of addrNameRes.rows) {
        const name = row.name || row.sc_name;
        if (!results.find((r) => r.address_hash === row.hash)) {
          results.push({
            type: row.is_contract ? 'contract' : 'address',
            address: row.hash,
            address_hash: row.hash,
            name: name || null,
            url: `/address/${row.hash}`,
            is_smart_contract_verified: Boolean(row.is_verified),
            is_smart_contract_address: Boolean(row.is_contract),
            certified: false,
            ens_info: null,
          });
        }
      }
    }

    res.json({ items: results, next_page_params: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/quick', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const results = [];

    if (q.startsWith('0x') && q.length === 66) {
      const [txRes, blockRes] = await Promise.all([
        query('SELECT hash, block_number, timestamp FROM transactions WHERE LOWER(hash) = LOWER($1)', [q]),
        query('SELECT number, hash, timestamp FROM blocks WHERE LOWER(hash) = LOWER($1)', [q]),
      ]);

      if (txRes.rows.length) {
        results.push({
          type: 'transaction',
          transaction_hash: txRes.rows[0].hash,
          url: `/tx/${txRes.rows[0].hash}`,
          timestamp: txRes.rows[0].timestamp,
        });
      }
      if (blockRes.rows.length) {
        results.push({
          type: 'block',
          block_number: Number(blockRes.rows[0].number),
          block_hash: blockRes.rows[0].hash,
          url: `/block/${blockRes.rows[0].hash}`,
          timestamp: blockRes.rows[0].timestamp,
        });
      }
    } else if (q.startsWith('0x') && q.length === 42) {
      const [addrRes, tokenRes] = await Promise.all([
        query('SELECT * FROM addresses WHERE LOWER(hash) = LOWER($1)', [q]),
        query('SELECT * FROM tokens WHERE LOWER(address) = LOWER($1)', [q]),
      ]);

      const addrRow = addrRes.rows[0];
      const tokenRow = tokenRes.rows[0];

      if (tokenRow) {
        results.push({
          type: 'token',
          address: tokenRow.address,
          address_hash: tokenRow.address,
          name: tokenRow.name || null,
          symbol: tokenRow.symbol || null,
          token_type: tokenRow.token_type || 'ERC-20',
          is_smart_contract_verified: Boolean(addrRow?.is_verified),
          is_smart_contract_address: true,
          is_verified_via_admin_panel: false,
          certified: false,
          icon_url: tokenRow.icon_url || null,
          exchange_rate: null,
          total_supply: tokenRow.total_supply?.toString() || null,
          token_url: `/token/${tokenRow.address}`,
          address_url: `/address/${tokenRow.address}`,
          reputation: null,
        });
      }

      results.push({
        type: addrRow?.is_contract || tokenRow ? 'contract' : 'address',
        address: q,
        address_hash: q,
        name: addrRow?.name || null,
        url: `/address/${q}`,
        is_smart_contract_verified: Boolean(addrRow?.is_verified),
        is_smart_contract_address: Boolean(addrRow?.is_contract) || Boolean(tokenRow),
        certified: false,
        ens_info: null,
      });
    } else if (/^\d+$/.test(q)) {
      const blockRes = await query('SELECT * FROM blocks WHERE number = $1 LIMIT 1', [Number(q)]);
      if (blockRes.rows.length) {
        results.push({
          type: 'block',
          block_number: Number(blockRes.rows[0].number),
          block_hash: blockRes.rows[0].hash,
          url: `/block/${blockRes.rows[0].number}`,
          timestamp: blockRes.rows[0].timestamp,
        });
      }
    } else {
      const tokenRes = await query(
        `SELECT * FROM tokens WHERE LOWER(name) LIKE LOWER($1) OR LOWER(symbol) LIKE LOWER($1) LIMIT 5`,
        [`%${q}%`],
      );
      for (const row of tokenRes.rows) {
        results.push({
          type: 'token',
          address: row.address,
          address_hash: row.address,
          name: row.name || null,
          symbol: row.symbol || null,
          token_type: row.token_type || 'ERC-20',
          is_smart_contract_verified: Boolean(row.is_verified),
          is_smart_contract_address: true,
          is_verified_via_admin_panel: false,
          certified: false,
          icon_url: row.icon_url || null,
          exchange_rate: null,
          total_supply: row.total_supply?.toString() || null,
          token_url: `/token/${row.address}`,
          address_url: `/address/${row.address}`,
          reputation: null,
        });
      }

      const addrNameRes = await query(
        `SELECT a.*, sc.name as sc_name FROM addresses a
         LEFT JOIN smart_contracts sc ON LOWER(sc.address) = LOWER(a.hash)
         WHERE LOWER(COALESCE(a.name, sc.name)) LIKE LOWER($1) LIMIT 5`,
        [`%${q}%`],
      );
      for (const row of addrNameRes.rows) {
        const name = row.name || row.sc_name;
        if (!results.find((r) => r.address_hash === row.hash)) {
          results.push({
            type: row.is_contract ? 'contract' : 'address',
            address: row.hash,
            address_hash: row.hash,
            name: name || null,
            url: `/address/${row.hash}`,
            is_smart_contract_verified: Boolean(row.is_verified),
            is_smart_contract_address: Boolean(row.is_contract),
            certified: false,
            ens_info: null,
          });
        }
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/check-redirect', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (q.startsWith('0x') && q.length === 66) {
      const [txRes, blockRes] = await Promise.all([
        query('SELECT hash FROM transactions WHERE LOWER(hash) = LOWER($1)', [q]),
        query('SELECT number FROM blocks WHERE LOWER(hash) = LOWER($1)', [q]),
      ]);
      if (txRes.rows.length) return res.json({ redirect: true, type: 'transaction', parameter: txRes.rows[0].hash });
      if (blockRes.rows.length) return res.json({ redirect: true, type: 'block', parameter: blockRes.rows[0].number.toString() });
    }

    if (q.startsWith('0x') && q.length === 42) {
      return res.json({ redirect: true, type: 'address', parameter: q });
    }

    if (/^\d+$/.test(q)) {
      return res.json({ redirect: true, type: 'block', parameter: q });
    }

    res.json({ redirect: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
