export const CELO_EPOCH_ITEM = {
  distribution: { community_target_epoch_reward: '0', carbon_offsetting_target_epoch_reward: '0', reserve_bolster: '0' },
  end_processing_block_hash: null,
  end_processing_block_number: null,
  end_processing_timestamp: null,
  number: 1,
  start_processing_block_hash: null,
  start_processing_block_number: null,
  start_processing_timestamp: null,
};

export const CELO_EPOCH = {
  ...CELO_EPOCH_ITEM,
  elected_validators: [],
  next_election: null,
};
