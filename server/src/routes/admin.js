import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getBlacklist, addToBlacklist, removeFromBlacklist } from '../blacklist.js';
import { query } from '../db/postgres.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'changeme';
  if (username !== expectedUser || password !== expectedPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const secret = process.env.ADMIN_JWT_SECRET || 'admin_secret_fallback';
  const token = jwt.sign({ role: 'admin', username }, secret, { expiresIn: '24h' });
  res.json({ token });
});

router.get('/tokens', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT address, name, symbol, token_type as type, decimals, total_supply, holders_count, icon_url
       FROM tokens ORDER BY holders_count DESC NULLS LAST LIMIT 500`,
    );
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/blacklist', requireAdmin, (req, res) => {
  res.json({ items: getBlacklist() });
});

router.post('/blacklist', requireAdmin, (req, res) => {
  const { address } = req.body || {};
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  addToBlacklist(address);
  res.json({ ok: true, address: address.toLowerCase() });
});

router.delete('/blacklist/:address', requireAdmin, (req, res) => {
  const { address } = req.params;
  removeFromBlacklist(address);
  res.json({ ok: true });
});

export default router;
