const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null };

export const USER_OPS_ITEM = {
  block_number: 0,
  fee: { type: 'actual', value: '0' },
  hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  sender: EMPTY_ADDR,
  status: 'success',
  timestamp: new Date().toISOString(),
  transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

export const USER_OPS_ACCOUNT = {
  total_ops: '0',
};

export const USER_OP = {
  ...USER_OPS_ITEM,
  bundler: EMPTY_ADDR,
  call_data: '0x',
  call_gas_limit: '0',
  entry_point: EMPTY_ADDR,
  execute_call_data: null,
  execute_target: null,
  factory: null,
  max_fee_per_gas: '0',
  max_priority_fee_per_gas: '0',
  nonce: '0',
  paymaster: null,
  pre_verification_gas: '0',
  signature: '0x',
  verification_gas_limit: '0',
};
