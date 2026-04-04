const EMPTY_ADDR = { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: true, is_verified: false, ens_domain_name: null };

export const VERIFIED_CONTRACTS_COUNTERS = {
  new_smart_contracts_24h: '0',
  new_verified_smart_contracts_24h: '0',
  smart_contracts: '0',
  verified_smart_contracts: '0',
};

export const VERIFIED_CONTRACTS_COUNTERS_MICROSERVICE = {
  ...VERIFIED_CONTRACTS_COUNTERS,
};

export const VERIFIED_CONTRACT_INFO = {
  address: EMPTY_ADDR,
  coin_balance: null,
  compiler_version: '0.8.0',
  has_constructor_args: false,
  language: 'solidity',
  license_type: null,
  market_cap: null,
  optimization_enabled: false,
  tx_count: null,
  verified_at: new Date().toISOString(),
};

export const HOT_CONTRACTS = {
  address: EMPTY_ADDR,
  total_calls: '0',
};

export const CONTRACT_CODE = {
  bytecode: '0x',
  creation_bytecode: null,
  deployed_bytecode: '0x',
  is_self_destructed: false,
  is_verified_via_eth_bytecode_db: false,
  is_verified_via_sourcify: false,
  is_vyper_contract: false,
};

export const SMART_CONTRACT = {
  abi: null,
  additional_sources: [],
  address_hash: '0x0000000000000000000000000000000000000000',
  can_be_visualized_via_sol2uml: false,
  compiler_settings: null,
  compiler_version: '0.8.0',
  constructor_args: null,
  creation_bytecode: null,
  decoded_constructor_args: null,
  deployed_bytecode: '0x',
  evm_version: null,
  external_libraries: [],
  file_path: '',
  has_methods_read: false,
  has_methods_read_proxy: false,
  has_methods_write: false,
  has_methods_write_proxy: false,
  implementation_address: null,
  implementation_name: null,
  is_blueprint: false,
  is_changed_bytecode: false,
  is_fully_verified: false,
  is_partially_verified: false,
  is_self_destructed: false,
  is_verified: false,
  is_verified_via_eth_bytecode_db: false,
  is_verified_via_sourcify: false,
  is_vyper_contract: false,
  language: 'solidity',
  license_type: null,
  name: null,
  optimization_enabled: false,
  optimization_runs: null,
  source_code: '',
  sourcify_repo_url: null,
  verified_at: null,
};

export const CONTRACT_CODE_UNVERIFIED = {
  ...SMART_CONTRACT,
  is_verified: false,
  is_fully_verified: false,
  source_code: null,
};

export const CONTRACT_CODE_VERIFIED = {
  ...SMART_CONTRACT,
  is_verified: true,
  is_fully_verified: true,
  source_code: '// Contract source code',
  compiler_version: '0.8.0',
  verified_at: new Date().toISOString(),
};
