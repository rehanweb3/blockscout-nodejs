export const SHIBARIUM_DEPOSIT_ITEM = {
  block: 0,
  l1_block_number: null,
  l1_transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  l2_transaction_hash: null,
  originator: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false },
  status: 'initiated',
  timestamp: new Date().toISOString(),
  user: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false },
  value: '0',
};

export const SHIBARIUM_WITHDRAWAL_ITEM = {
  ...SHIBARIUM_DEPOSIT_ITEM,
};
