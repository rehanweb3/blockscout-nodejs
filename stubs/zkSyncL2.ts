export const ZKSYNC_L2_TXN_BATCH = {
  batch_size: null,
  blocks_count: 0,
  commit_transaction_hash: null,
  commit_transaction_timestamp: null,
  end_block: null,
  executed_at: null,
  l1_gas_price: '0',
  l1_tx_count: 0,
  l2_fair_gas_price: '0',
  l2_tx_count: 0,
  number: 0,
  prove_transaction_hash: null,
  prove_transaction_timestamp: null,
  root_hash: null,
  start_block: null,
  status: 'committed',
};

export const ZKSYNC_L2_TXN_BATCHES_ITEM = { ...ZKSYNC_L2_TXN_BATCH };
