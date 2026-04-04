import { Router } from 'express';
import { query } from '../../db/postgres.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [latestIndexedRes, latestChainRes] = await Promise.all([
      query('SELECT MAX(number) as max FROM blocks'),
      query("SELECT value FROM indexer_state WHERE key = 'latest_chain_block'"),
    ]);

    const indexedBlocks = Number(latestIndexedRes.rows[0]?.max || 0);
    const chainBlocks = Number(latestChainRes.rows[0]?.value || indexedBlocks);
    const ratio = chainBlocks > 0 ? (indexedBlocks / chainBlocks).toFixed(4) : '1.0000';

    res.json({
      finished_indexing: indexedBlocks >= chainBlocks,
      finished_indexing_blocks: indexedBlocks >= chainBlocks,
      indexed_blocks_ratio: ratio,
      indexed_internal_transactions_ratio: '1.0000',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
