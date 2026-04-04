export const STATS_COUNTER = {
  id: 'totalBlocks',
  title: 'Total blocks',
  value: '0',
  units: null,
  description: 'Total number of blocks',
};

export const STATS_CHARTS_SECTION_GAS = {
  id: 'gas',
  title: 'Gas',
  charts: [
    { id: 'average_gas_price', title: 'Average gas price', description: 'Average gas price paid per day', units: 'Gwei' },
    { id: 'network_utilization_percentage', title: 'Network utilization', description: 'Average network utilization per day', units: '%' },
  ],
};

export const STATS_CHARTS = {
  sections: [
    {
      id: 'transactions',
      title: 'Transactions',
      charts: [
        { id: 'txns_count', title: 'Daily transactions', description: 'Number of transactions per day', units: null },
        { id: 'average_txn_fee', title: 'Average transaction fee', description: 'Average transaction fee per day', units: 'ETH' },
      ],
    },
    {
      id: 'blocks',
      title: 'Blocks',
      charts: [
        { id: 'new_blocks', title: 'New blocks', description: 'Number of blocks produced per day', units: null },
        { id: 'average_block_time', title: 'Average block time', description: 'Average time between blocks', units: 's' },
      ],
    },
    STATS_CHARTS_SECTION_GAS,
  ],
};

export const HOMEPAGE_STATS = {
  total_blocks: '0',
  total_addresses: '0',
  total_transactions: '0',
  average_block_time: 12000,
  coin_price: null,
  coin_price_change_percentage: null,
  total_gas_used: '0',
  transactions_today: null,
  gas_used_today: '0',
  gas_prices: null,
  gas_price_updated_at: null,
  gas_prices_update_in: 30000,
  static_gas_price: null,
  market_cap: null,
  network_utilization_percentage: 0,
  tvl: null,
  coin_image: '/native.png',
  secondary_coin_image: null,
};
