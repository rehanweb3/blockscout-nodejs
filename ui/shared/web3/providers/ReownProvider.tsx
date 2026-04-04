import React from 'react';

import { MetaMaskProvider } from 'lib/web3/MetaMaskContext';

interface Props {
  children: React.ReactNode;
}

const ReownProvider = ({ children }: Props) => {
  return <MetaMaskProvider>{ children }</MetaMaskProvider>;
};

export default React.memo(ReownProvider);
