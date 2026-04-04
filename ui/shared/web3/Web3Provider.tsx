import React from 'react';
import { WagmiProvider } from 'wagmi';

import wagmiConfig from 'lib/web3/wagmiConfig';

interface Props {
  children: React.ReactNode;
}

const Web3Provider = ({ children }: Props) => {
  return (
    <WagmiProvider config={ wagmiConfig.config }>
      { children }
    </WagmiProvider>
  );
};

export default Web3Provider;
