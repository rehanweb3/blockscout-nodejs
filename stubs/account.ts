export const API_KEY = {
  api_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  key_type: 'shared',
  name: 'My API Key',
  uuid: '00000000-0000-0000-0000-000000000000',
};

export const CUSTOM_ABI = {
  abi: '[]',
  contract_address_hash: '0x0000000000000000000000000000000000000000',
  id: 1,
  name: 'My Contract',
};

export const TOKEN_INFO_APPLICATION = {
  application_status: 'waiting',
  contract_address: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: true, is_verified: false, ens_domain_name: null },
  id: '1',
  token_name: 'Token',
  token_symbol: 'TKN',
};

export const VERIFIED_ADDRESS = {
  created_at: new Date().toISOString(),
  id: '1',
  message: '',
  name: 'Address',
  signature: '0x',
  user_created: true,
  verified_at: new Date().toISOString(),
};

export const WATCH_LIST_ITEM_WITH_TOKEN_INFO = {
  address_hash: '0x0000000000000000000000000000000000000000',
  email: false,
  id: 1,
  name: 'Watchlist Item',
  address: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null },
  notification_methods: { email: false },
  notification_types: { native: false, 'ERC-20': false, 'ERC-721': false, 'ERC-404': false, 'ERC-1155': false },
};

export const PRIVATE_TAG_ADDRESS = {
  address_hash: '0x0000000000000000000000000000000000000000',
  id: 1,
  label: 'My Tag',
  address: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null },
};

export const PRIVATE_TAG_TX = {
  id: 1,
  label: 'My Tag',
  transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
