export const INTERCHAIN_TRANSFER = {
  id: '0',
  timestamp: new Date().toISOString(),
  sender: '0x0000000000000000000000000000000000000000',
  receiver: '0x0000000000000000000000000000000000000000',
  amount: '0',
  token: '0x0000000000000000000000000000000000000000',
  source_chain_id: 1,
  destination_chain_id: 1,
  tx_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  status: 'delivered',
};

export const INTERCHAIN_MESSAGE = {
  id: '0',
  timestamp: new Date().toISOString(),
  sender: '0x0000000000000000000000000000000000000000',
  receiver: '0x0000000000000000000000000000000000000000',
  value: '0',
  status: 'delivered',
  origin_chain_id: 1,
  destination_chain_id: 1,
  tx_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
