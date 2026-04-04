export const SCROLL_L2_MESSAGE_ITEM = {
  block_number: 0,
  id: 0,
  origination_transaction_block_number: null,
  origination_transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  origination_timestamp: new Date().toISOString(),
  relay_transaction_hash: null,
  status: 'pending',
  value: '0',
};

export const SCROLL_L2_TXN_BATCH = {
  batch_blocks_count: 0,
  batch_size: null,
  blocks_count: 0,
  commit_transaction_hash: null,
  commit_transaction_timestamp: null,
  end_block: null,
  finalize_transaction_hash: null,
  finalize_transaction_timestamp: null,
  number: 0,
  rollup_status: 'committed',
  start_block: null,
  transaction_count: 0,
};
