export const TX_STATE_CHANGE = {
  address: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null },
  balance_after: '0',
  balance_before: '0',
  change: '0',
  is_miner: false,
  token: null,
  token_id: null,
  type: 'coin',
};

export const TX_STATE_CHANGES = Array(3).fill(TX_STATE_CHANGE);
