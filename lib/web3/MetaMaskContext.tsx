import React from 'react';

interface MetaMaskContextType {
  account: string | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MetaMaskContext = React.createContext<MetaMaskContextType>({
  account: undefined,
  isConnected: false,
  chainId: undefined,
  connect: async () => {},
  disconnect: () => {},
});

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [ account, setAccount ] = React.useState<string | undefined>();
  const [ chainId, setChainId ] = React.useState<number | undefined>();

  React.useEffect(() => {
    const eth = (window as Window & { ethereum?: { request: (a: {method: string}) => Promise<unknown>; on: (e: string, h: unknown) => void; removeListener: (e: string, h: unknown) => void } }).ethereum;
    if (!eth) return;

    eth.request({ method: 'eth_accounts' }).then((accounts) => {
      const arr = accounts as string[];
      if (arr[0]) setAccount(arr[0]);
    }).catch(() => {});

    eth.request({ method: 'eth_chainId' }).then((id) => {
      setChainId(parseInt(id as string, 16));
    }).catch(() => {});

    const onAccountsChanged = (accounts: unknown) => {
      const arr = accounts as string[];
      setAccount(arr[0] || undefined);
    };
    const onChainChanged = (id: unknown) => {
      setChainId(parseInt(id as string, 16));
    };

    eth.on('accountsChanged', onAccountsChanged);
    eth.on('chainChanged', onChainChanged);

    return () => {
      eth.removeListener('accountsChanged', onAccountsChanged);
      eth.removeListener('chainChanged', onChainChanged);
    };
  }, []);

  const connect = React.useCallback(async () => {
    const eth = (window as Window & { ethereum?: { request: (a: {method: string}) => Promise<unknown> } }).ethereum;
    if (!eth) {
      window.open('https://metamask.io', '_blank');
      return;
    }
    try {
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      if (accounts[0]) setAccount(accounts[0]);
    } catch {}
  }, []);

  const disconnect = React.useCallback(() => setAccount(undefined), []);

  const value = React.useMemo(
    () => ({ account, isConnected: Boolean(account), chainId, connect, disconnect }),
    [ account, chainId, connect, disconnect ],
  );

  return <MetaMaskContext.Provider value={ value }>{ children }</MetaMaskContext.Provider>;
}

export function useMetaMask() {
  return React.useContext(MetaMaskContext);
}

export default MetaMaskContext;
