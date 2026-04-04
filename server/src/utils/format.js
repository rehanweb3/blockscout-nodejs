import { ethers } from 'ethers';

export function formatBlock(row) {
  if (!row) return null;
  return {
    height: Number(row.number),
    hash: row.hash,
    parent_hash: row.parent_hash,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    miner: { hash: row.miner || '0x0000000000000000000000000000000000000000' },
    gas_used: row.gas_used?.toString() || '0',
    gas_limit: row.gas_limit?.toString() || '0',
    base_fee_per_gas: row.base_fee_per_gas?.toString() || null,
    transactions_count: Number(row.transaction_count || 0),
    internal_transactions_count: 0,
    size: Number(row.size || 0),
    nonce: row.nonce || '0x0000000000000000',
    difficulty: row.difficulty?.toString() || '0',
    total_difficulty: row.total_difficulty?.toString() || null,
    extra_data: row.extra_data || '0x',
    state_root: row.state_root || null,
    burnt_fees: null,
    priority_fee: null,
    gas_target_percentage: null,
    gas_used_percentage: null,
    burnt_fees_percentage: null,
    type: 'block',
    transaction_fees: null,
    uncles_hashes: [],
    rewards: [],
  };
}

export function formatTransaction(row) {
  if (!row) return null;
  const status = row.status === 1 ? 'ok' : row.status === 0 ? 'error' : null;

  const fromAddr = row.from_address || '0x0000000000000000000000000000000000000000';
  const toAddr = row.to_address || null;

  const fromObj = {
    hash: fromAddr,
    name: row.from_name || null,
    is_contract: row.from_is_contract || false,
    is_verified: row.from_is_verified || false,
    ens_domain_name: null,
    implementations: [],
  };

  const toObj = toAddr ? {
    hash: toAddr,
    name: row.to_name || null,
    is_contract: row.to_is_contract || false,
    is_verified: row.to_is_verified || false,
    ens_domain_name: null,
    implementations: [],
  } : null;

  const createdContract = row.to_address === null && row.contract_address ? {
    hash: row.contract_address,
    name: row.contract_name || null,
    is_contract: true,
    is_verified: row.contract_is_verified || false,
    ens_domain_name: null,
    implementations: [],
  } : null;

  return {
    hash: row.hash,
    block_number: Number(row.block_number),
    block_hash: row.block_hash,
    position: Number(row.position || 0),
    from: fromObj,
    to: toObj,
    created_contract: createdContract,
    value: row.value?.toString() || '0',
    fee: {
      type: 'actual',
      value: row.gas_used && row.gas_price
        ? (BigInt(row.gas_used) * BigInt(row.gas_price)).toString()
        : '0',
    },
    gas_limit: row.gas?.toString() || '0',
    gas_used: row.gas_used?.toString() || null,
    gas_price: row.gas_price?.toString() || null,
    max_fee_per_gas: row.max_fee_per_gas?.toString() || null,
    max_priority_fee_per_gas: row.max_priority_fee_per_gas?.toString() || null,
    priority_fee: null,
    base_fee_per_gas: null,
    transaction_burnt_fee: null,
    nonce: Number(row.nonce || 0),
    raw_input: row.input || '0x',
    status,
    result: status === 'ok' ? 'success' : status === 'error' ? 'Reverted' : 'pending',
    confirmations: 0,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    confirmation_duration: null,
    type: Number(row.type || 0),
    decoded_input: null,
    token_transfers: null,
    token_transfers_overflow: false,
    exchange_rate: null,
    historic_exchange_rate: null,
    method: row.input && row.input.length >= 10 ? row.input.slice(0, 10) : null,
    transaction_types: (() => {
      const types = [];
      if (row.to_address === null && row.contract_address) {
        types.push('contract_creation');
      } else if (row.to_is_contract && row.input && row.input.length > 2) {
        types.push('contract_call');
      } else if (row.input && row.input.length > 2) {
        types.push('contract_call');
      }
      return types;
    })(),
    transaction_tag: null,
    revert_reason: null,
    actions: [],
  };
}

export function formatAddress(row) {
  if (!row) return null;
  return {
    hash: row.hash,
    is_contract: row.is_contract || false,
    is_verified: row.is_verified || false,
    name: row.name || null,
    coin_balance: row.balance?.toString() || '0',
    exchange_rate: null,
    block_number_balance_updated_at: null,
    creator_address_hash: null,
    creation_transaction_hash: null,
    creation_status: null,
    ens_domain_name: null,
    has_logs: false,
    has_token_transfers: false,
    has_tokens: false,
    has_validated_blocks: false,
    implementations: null,
    token: null,
    watchlist_address_id: null,
    proxy_type: null,
    private_tags: [],
    public_tags: [],
    watchlist_names: [],
  };
}

export function paginate(items, nextPageParams) {
  return {
    items,
    next_page_params: nextPageParams || null,
  };
}

export function weiToEther(wei) {
  try {
    return ethers.formatEther(BigInt(wei || 0));
  } catch {
    return '0';
  }
}
