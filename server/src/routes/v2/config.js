import { Router } from 'express';

const router = Router();

router.get('/backend-version', async (req, res) => {
  res.json({ backend_version: '1.0.0' });
});

export default router;
