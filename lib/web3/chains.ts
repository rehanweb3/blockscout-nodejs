import config from 'configs/app';

export const chains = [] as Array<unknown>;

export const parentChain = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [] as string[] },
    public: { http: [] as string[] },
  },
};

const rpcHttp = (config.chain.rpcUrl ? [ config.chain.rpcUrl ] : []) as string[];

export const defaultChain = {
  id: config.chain.id ? Number(config.chain.id) : 1,
  name: config.chain.name || 'Ethereum',
  nativeCurrency: {
    name: config.chain.currency.name || 'Ether',
    symbol: config.chain.currency.symbol || 'ETH',
    decimals: config.chain.currency.decimals || 18,
  },
  rpcUrls: {
    default: { http: rpcHttp },
    public: { http: rpcHttp },
  },
};
