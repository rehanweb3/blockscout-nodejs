export const SEARCH_RESULT_ADDRESS = {
  address: '0x0000000000000000000000000000000000000000',
  is_smart_contract_verified: false,
  name: null,
  type: 'address',
  url: '/address/0x0000000000000000000000000000000000000000',
};
export const SEARCH_RESULT_TOKEN = {
  address: '0x0000000000000000000000000000000000000000',
  exchange_rate: null,
  icon_url: null,
  is_smart_contract_verified: false,
  is_verified_via_admin_panel: false,
  name: 'Token',
  symbol: 'TKN',
  token_type: 'ERC-20',
  total_supply: '0',
  type: 'token',
  url: '/token/0x0000000000000000000000000000000000000000',
};
export const SEARCH_RESULT_BLOCK = {
  block_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  block_number: 0,
  timestamp: new Date().toISOString(),
  type: 'block',
  url: '/block/0',
};
export const SEARCH_RESULT_TX = {
  timestamp: new Date().toISOString(),
  tx_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  type: 'transaction',
  url: '/tx/0x0000000000000000000000000000000000000000000000000000000000000000',
};
export const SEARCH_RESULT_USER_OP = {
  timestamp: new Date().toISOString(),
  transaction_hash: null,
  type: 'user_operation',
  url: '/op/0x0000000000000000000000000000000000000000000000000000000000000000',
  user_operation_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
export const SEARCH_RESULT_DOMAIN = {
  address: null,
  expiry_date: null,
  is_expired: false,
  name: 'example.eth',
  type: 'ens_domain',
  url: '/name-domains/example.eth',
};
export const SEARCH_RESULT_BLOB = {
  blob_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  type: 'blob',
  url: '/blob/0x0000000000000000000000000000000000000000000000000000000000000000',
};

export const SEARCH_RESULT_ITEM = SEARCH_RESULT_ADDRESS;
export const SEARCH_RESULT_NEXT_PAGE_PARAMS = { q: '', next_page: '2' };
