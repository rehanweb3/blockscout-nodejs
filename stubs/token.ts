const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: true, is_verified: false, ens_domain_name: null };

const BASE_TOKEN = {
  address: '0x0000000000000000000000000000000000000000',
  name: 'Token',
  symbol: 'TKN',
  decimals: '18',
  icon_url: null,
  holders: '0',
  total_supply: '0',
  exchange_rate: null,
  volume_24h: null,
  circulating_market_cap: null,
};

export const TOKEN_INFO_ERC_20 = {
  ...BASE_TOKEN,
  type: 'ERC-20',
};

export const TOKEN_INFO_ERC_721 = {
  ...BASE_TOKEN,
  type: 'ERC-721',
  decimals: null,
};

export const TOKEN_INFO_ERC_1155 = {
  ...BASE_TOKEN,
  type: 'ERC-1155',
  decimals: null,
};

export const TOKEN_INSTANCE = {
  animation_url: null,
  external_app_url: null,
  holder_address_hash: null,
  id: '0',
  image_url: null,
  is_unique: true,
  metadata: null,
  owner: null,
  thumbnails: null,
  token: TOKEN_INFO_ERC_721,
};

export const TOKEN_TRANSFER = {
  block_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  from: EMPTY_ADDR,
  log_index: '0',
  method: null,
  timestamp: new Date().toISOString(),
  to: EMPTY_ADDR,
  token: TOKEN_INFO_ERC_20,
  total: { decimals: '18', value: '0' },
  transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  type: 'token_transfer',
};

export const TOKEN_HOLDER = {
  address: EMPTY_ADDR,
  token_id: null,
  value: '0',
};

export function getTokenTransfersStub(_type?: string | null) {
  return {
    items: Array(50).fill(TOKEN_TRANSFER),
    next_page_params: null,
  };
}

export function getTokenHoldersStub(_type?: string | null, _params: unknown = null) {
  return {
    items: Array(50).fill(TOKEN_HOLDER),
    next_page_params: null,
  };
}
