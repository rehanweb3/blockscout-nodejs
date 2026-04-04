import { createConfig, http, injected } from 'wagmi';

import { defaultChain } from 'lib/web3/chains';

const wagmiChain = {
  ...defaultChain,
} as Parameters<typeof createConfig>[0]['chains'][0];

const config = createConfig({
  chains: [ wagmiChain ],
  connectors: [ injected() ],
  transports: {
    [defaultChain.id]: http(defaultChain.rpcUrls.default.http[0] || undefined),
  },
  ssr: true,
});

const wagmiConfig = {
  config,
  chains: [ wagmiChain ],
  connectors: [],
  adapter: null,
};

export default wagmiConfig;
