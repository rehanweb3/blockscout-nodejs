const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false, ens_domain_name: null };

export const STABILITY_VALIDATOR = {
  address: EMPTY_ADDR,
  blocks_validated: '0',
  gas_limit: '0',
  state: 'active',
};

export const VALIDATOR = {
  address: EMPTY_ADDR,
  blocks_validated: '0',
  state: 'active',
};

export const CELO_VALIDATOR = {
  address: EMPTY_ADDR,
  blocks_validated_count: 0,
  group: EMPTY_ADDR,
  locked_gold: '0',
  name: null,
  online: false,
  score: '0',
};

export const CELO_VALIDATOR_GROUP = {
  active_votes: '0',
  address: EMPTY_ADDR,
  affiliated: [],
  lockedGold: '0',
  name: null,
  pending_votes: '0',
  votes: '0',
};

export const VALIDATOR_STABILITY = {
  address: EMPTY_ADDR,
  blocks_validated: '0',
  gas_limit: '0',
  state: 'active',
};

export const VALIDATOR_BLACKFORT = {
  address: EMPTY_ADDR,
  blocks_validated: '0',
  name: null,
  state: 'active',
};

export const VALIDATORS_BLACKFORT_COUNTERS = {
  new_validators_counter_24h: '0',
  validators_counter: '0',
};

export const VALIDATOR_ZILLIQA = {
  address: EMPTY_ADDR,
  balance: '0',
  bls_public_key: '0x',
  reward_address: EMPTY_ADDR,
  stake_amount: '0',
};

export const VALIDATORS_ZILLIQA_ITEM = {
  ...VALIDATOR_ZILLIQA,
};
