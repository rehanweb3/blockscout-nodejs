import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.json({
    openapi_spec_folder_name: 'blockscout',
    backend_version: '1.0.0',
    chain_id: process.env.NEXT_PUBLIC_NETWORK_ID || '1',
    currency: {
      symbol: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL || 'ATH',
      name: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_NAME || 'Ather',
      decimals: parseInt(process.env.NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS || '18', 10),
    },
    is_testnet: process.env.NEXT_PUBLIC_IS_TESTNET === 'true',
  });
});

router.get('/backend-version', async (req, res) => {
  res.json({ backend_version: '1.0.0' });
});

export default router;
