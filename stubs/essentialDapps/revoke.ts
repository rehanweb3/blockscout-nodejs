export const ALLOWANCES = {
  allowances: Array(10).fill({
    allowance: '0',
    allowed_address: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: true, is_verified: false },
    block_hash: null,
    block_number: null,
    token: { address: '0x0000000000000000000000000000000000000000', name: 'Token', symbol: 'TKN', decimals: '18', type: 'ERC-20', icon_url: null },
    transaction_hash: null,
    updated_at: new Date().toISOString(),
  }),
  next_page_params: null,
};
