export const FHE_OPERATION = {
  block_number: 0,
  error: null,
  gas_estimation: '0',
  gas_used: '0',
  hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  handle: '0x',
  inputs: [],
  operation: 'add',
  result: '0x',
  timestamp: new Date().toISOString(),
};

export const FHE_OPERATIONS_RESPONSE = {
  items: [ FHE_OPERATION ],
  next_page_params: null,
};
