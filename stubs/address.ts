const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null, implementation_name: null, is_scam: false };

export const ADDRESS_INFO = {
  hash: '0x0000000000000000000000000000000000000000',
  name: null,
  is_contract: false,
  is_verified: false,
  ens_domain_name: null,
  implementation_name: null,
  is_scam: false,
  block_number_balance_updated_at: null,
  coin_balance: '0',
  creation_tx_hash: null,
  creator_address_hash: null,
  exchange_rate: null,
  has_beacon_chain_withdrawals: false,
  has_decompiled_code: false,
  has_logs: false,
  has_methods_read: false,
  has_methods_read_proxy: false,
  has_methods_write: false,
  has_methods_write_proxy: false,
  has_token_transfers: false,
  has_tokens: false,
  has_validated_blocks: false,
  implementations: [],
  is_fully_indexed: true,
  token: null,
  watchlist_address_id: null,
};

export const TOP_ADDRESS = {
  ...ADDRESS_INFO,
  tx_count: '0',
};

export const ADDRESS_COIN_BALANCE = {
  block_number: 0,
  block_timestamp: new Date().toISOString(),
  delta: '0',
  transaction_hash: null,
  value: '0',
};

export const ADDRESS_TOKEN_BALANCE_ERC_20 = {
  token: { address: '0x0000000000000000000000000000000000000000', name: 'Token', symbol: 'TKN', decimals: '18', type: 'ERC-20', icon_url: null, holders: '0', total_supply: '0', exchange_rate: null, volume_24h: null, circulating_market_cap: null },
  token_id: null,
  token_instance: null,
  value: '0',
};

export const ADDRESS_NFT_1155 = {
  ...ADDRESS_TOKEN_BALANCE_ERC_20,
  token_id: '0',
};

export const ADDRESS_COLLECTION = {
  token: ADDRESS_TOKEN_BALANCE_ERC_20.token,
  amount: '1',
  token_instances: [],
};

export const ADDRESS_MUD_TABLE_ITEM = {
  schema: { key_schema: {}, value_schema: {} },
  table: { table_id: '0x', table_name: 'Table', key_names: [], value_names: [] },
};

export const ADDRESS_COUNTERS = {
  gas_usage_count: '0',
  token_transfers_count: '0',
  transactions_count: '0',
  validations_count: '0',
};

export const EPOCH_REWARD_ITEM = {
  account: EMPTY_ADDR,
  associated_account: EMPTY_ADDR,
  block_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  block_number: 0,
  date: new Date().toISOString(),
  epoch_number: 0,
  type: 'voter',
  value: '0',
};
