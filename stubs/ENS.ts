const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null };

export const ENS_DOMAIN = {
  expiry_date: null,
  id: null,
  is_expired: false,
  labels: [],
  name: 'example.eth',
  names_count: 1,
  other_addresses: {},
  owner: EMPTY_ADDR,
  registrant: null,
  registration_date: new Date().toISOString(),
  resolved_address: EMPTY_ADDR,
  resolver: null,
  stored_offchain: false,
  tokens: [],
};

export const ENS_DOMAIN_EVENT = {
  action: 'Transfer',
  from: EMPTY_ADDR,
  timestamp: new Date().toISOString(),
  to: EMPTY_ADDR,
  transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
