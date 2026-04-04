export const ARBITRUM_L2_TXN_BATCHES_ITEM = {
  number: 0,
  transactions_count: 0,
  timestamp: new Date().toISOString(),
  block_count: 0,
  commitment_transaction: { hash: '0x0000000000000000000000000000000000000000000000000000000000000000', status: 'ok' },
  confirmation_transaction: null,
};

export const ARBITRUM_MESSAGES_ITEM = {
  id: 0,
  orig_timestamp: new Date().toISOString(),
  orig_transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  orig_address: '0x0000000000000000000000000000000000000000',
  status: 'confirmed',
  completion_transaction_hash: null,
};
