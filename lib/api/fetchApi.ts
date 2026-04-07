import config from 'configs/app';

const API_BASE = `${config.apis.general.endpoint}/api/v2`;

const ROUTES: Record<string, (p?: Record<string, unknown>) => string> = {
  'stats': () => '/stats',
  'blocks': () => '/blocks',
  'block': (p) => `/blocks/${p?.height_or_hash}`,
  'block_txs': (p) => `/blocks/${p?.height_or_hash}/transactions`,
  'transactions': () => '/transactions',
  'transaction': (p) => `/transactions/${p?.hash}`,
  'transaction_token_transfers': (p) => `/transactions/${p?.hash}/token-transfers`,
  'transaction_internal_txs': (p) => `/transactions/${p?.hash}/internal-transactions`,
  'transaction_logs': (p) => `/transactions/${p?.hash}/logs`,
  'transaction_state_changes': (p) => `/transactions/${p?.hash}/state-changes`,
  'transaction_raw_trace': (p) => `/transactions/${p?.hash}/raw-trace`,
  'transaction_summary': (p) => `/transactions/${p?.hash}/summary`,
  'address': (p) => `/addresses/${p?.hash}`,
  'address_txs': (p) => `/addresses/${p?.hash}/transactions`,
  'address_token_transfers': (p) => `/addresses/${p?.hash}/token-transfers`,
  'address_tokens': (p) => `/addresses/${p?.hash}/tokens`,
  'address_internal_txs': (p) => `/addresses/${p?.hash}/internal-transactions`,
  'address_logs': (p) => `/addresses/${p?.hash}/logs`,
  'address_blocks_validated': (p) => `/addresses/${p?.hash}/blocks-validated`,
  'address_coin_balance': (p) => `/addresses/${p?.hash}/coin-balance-history`,
  'address_coin_balance_chart': (p) => `/addresses/${p?.hash}/coin-balance-history-by-day`,
  'address_tabs_counters': (p) => `/addresses/${p?.hash}/tabs-counters`,
  'address_counters': (p) => `/addresses/${p?.hash}/counters`,
  'addresses': () => '/addresses',
  'search': () => '/search',
  'quick_search': () => '/search/quick',
  'search_check_redirect': () => '/search/check-redirect',
  'token': (p) => `/tokens/${p?.hash}`,
  'token_transfers': (p) => `/tokens/${p?.hash}/transfers`,
  'token_holders': (p) => `/tokens/${p?.hash}/holders`,
  'token_counters': (p) => `/tokens/${p?.hash}/counters`,
  'tokens': () => '/tokens',
  'token_instance': (p) => `/tokens/${p?.hash}/instances/${p?.id}`,
  'token_instance_transfers': (p) => `/tokens/${p?.hash}/instances/${p?.id}/transfers`,
  'charts_market': () => '/stats/charts/market',
  'stats_charts_market': () => '/stats/charts/market',
  'charts_txs': () => '/stats/charts/transactions',
  'stats_charts_txs': () => '/stats/charts/transactions',
  'indexing_status': () => '/main-page/indexing-status',
  'homepage_blocks': () => '/main-page/blocks',
  'homepage_txs': () => '/main-page/transactions',
  'config_backend_version': () => '/config/backend-version',
  'config_backend': () => '/config',
  'smart_contracts': () => '/smart-contracts',
  'smart_contracts_counters': () => '/smart-contracts/counters',
  'verified_contracts': () => '/smart-contracts',
  'verified_contracts_counters': () => '/smart-contracts/counters',
  'txs_validated': () => '/transactions',
  'txs_pending': () => '/transactions',
  'txs_with_blobs': () => '/transactions',
  'txs_watchlist': () => '/transactions',
  'txs_execution_node': () => '/transactions',
  'internal_txs': () => '/internal-transactions',
  'advanced_filter': () => '/advanced-filters',
  'withdrawals': () => '/withdrawals',
  'deposits': () => '/deposits',
  'user_ops': () => '/user-ops',
  'address_deposits': (p) => `/addresses/${p?.hash}/deposits`,
  'address_withdrawals': (p) => `/addresses/${p?.hash}/withdrawals`,
  'address_epoch_rewards': (p) => `/addresses/${p?.hash}/epoch-rewards`,
  'address_collections': (p) => `/addresses/${p?.hash}/nft?type=ERC-721,ERC-1155`,
  'address_nfts': (p) => `/addresses/${p?.hash}/nft-holdings`,
  'noves_address_history': (p) => `/addresses/${p?.hash}/noves-transactions`,
  'mud_tables': (p) => `/mud/worlds/${p?.worldAddress}/tables`,
  'mud_records': (p) => `/mud/worlds/${p?.worldAddress}/tables/${p?.tableId}/records`,
  'mud_worlds': () => '/mud/worlds',
  'block_deposits': (p) => `/blocks/${p?.height_or_hash}/deposits`,
  'block_withdrawals': (p) => `/blocks/${p?.height_or_hash}/withdrawals`,
  'block_internal_txs': (p) => `/blocks/${p?.height_or_hash}/internal-transactions`,
  'tx_blobs': (p) => `/transactions/${p?.hash}/blobs`,
  'tx_internal_txs': (p) => `/transactions/${p?.hash}/internal-transactions`,
  'tx_logs': (p) => `/transactions/${p?.hash}/logs`,
  'tx_state_changes': (p) => `/transactions/${p?.hash}/state-changes`,
  'tx_token_transfers': (p) => `/transactions/${p?.hash}/token-transfers`,
  'addresses_metadata_search': () => '/metadata/addresses',
  'stats_hot_contracts': () => '/stats/contracts',
  'token_inventory': (p) => `/tokens/${p?.hash}/instances`,
  'token_instance_holders': (p) => `/tokens/${p?.hash}/instances/${p?.id}/holders`,
  'token_transfers_all': () => '/token-transfers',
  'watchlist': () => '/watchlist',
  'private_tags_address': () => '/private-tags/addresses',
  'private_tags_tx': () => '/private-tags/transactions',
  'tx': (p) => `/transactions/${p?.hash}`,
  'tx_raw_trace': (p) => `/transactions/${p?.hash}/raw-trace`,
  'tx_interpretation': (p) => `/transactions/${p?.hash}/summary`,
  'tx_fhe_operations': (p) => `/transactions/${p?.hash}/fhe-operations`,
  'tx_external_transactions': (p) => `/transactions/${p?.hash}/external-transactions`,
  'noves_transaction': (p) => `/transactions/${p?.hash}/summary`,
  'operation_by_tx_hash': (p) => `/transactions/${p?.tx_hash}/operations`,
  'tx_messages': (p) => `/transactions/${p?.hash}/messages`,
  'gas_tracker': () => '/gas-tracker',
  'stats_counters': () => '/stats/counters',
  'stats_charts': () => '/stats/charts',
  'counters': () => '/stats/counters',
  'lines': () => '/stats/lines',
  'line': (p) => `/stats/lines/${p?.id}`,
  'contract': (p) => `/smart-contracts/${p?.hash}`,
  'contract_verification_config': () => '/smart-contracts/verification/config',
  'contract_verification_via': (p) => `/smart-contracts/${p?.hash}/verification-via/${p?.method}`,
  'tac_operation_by_tx_hash': (p) => `/transactions/${p?.tx_hash}/operations`,
  'interchain_tx_messages': (p) => `/transactions/${p?.hash}/messages`,
};

export default async function fetchApi<T>(
  resource: string,
  pathParams?: Record<string, unknown>,
  queryParams?: Record<string, unknown>,
  fetchParams?: RequestInit,
): Promise<T> {
  const normalizedResource = resource.includes(':') ? resource.split(':').slice(1).join(':') : resource;
  const routeFn = ROUTES[normalizedResource] || ROUTES[resource];
  if (!routeFn) {
    throw new Error(`Unknown API resource: ${resource}`);
  }

  const path = routeFn(pathParams);
  const baseStr = `${API_BASE}${path}`;
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  const url = new URL(baseStr.startsWith('http') ? baseStr : `${base}${baseStr}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([ key, value ]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const fetchUrl = url.pathname + (url.search || '');
  const isLocal = url.toString().startsWith(base);

  const { headers: extraHeaders, body: fetchBody, ...restFetchParams } = fetchParams || {};
  const isFormData = typeof FormData !== 'undefined' && fetchBody instanceof FormData;
  const isPlainObject = fetchBody !== null && fetchBody !== undefined && typeof fetchBody === 'object' && !isFormData;
  const serializedBody = isPlainObject ? JSON.stringify(fetchBody) : fetchBody;
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
  const mergedHeaders = extraHeaders
    ? { ...defaultHeaders, ...(extraHeaders as Record<string, string>) }
    : defaultHeaders;

  const response = await fetch(isLocal ? fetchUrl : url.toString(), {
    ...restFetchParams,
    ...(serializedBody !== undefined ? { body: serializedBody as BodyInit } : {}),
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const error: { status: number; statusText: string; payload?: unknown } = {
      status: response.status,
      statusText: response.statusText,
    };
    try {
      error.payload = await response.json();
    } catch {}
    throw error;
  }

  return response.json() as Promise<T>;
}
