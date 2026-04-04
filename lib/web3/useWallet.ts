import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface UseWalletOptions {
  source?: string;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
      on: (event: string, handler: (...args: Array<unknown>) => void) => void;
      removeListener: (event: string, handler: (...args: Array<unknown>) => void) => void;
    };
  }
}

export default function useWallet(_options?: UseWalletOptions) {
  const { address, isConnected, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [ isPending, setIsPending ] = React.useState(false);

  const handleConnect = React.useCallback(async() => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsPending(true);
    try {
      // Directly request accounts — this is the call that triggers the MetaMask popup.
      // It must be called synchronously within the click handler (user gesture context).
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as Array<string>;

      if (accounts.length > 0) {
        // Sync wagmi's internal state so useWalletClient / useAccount also update.
        const wagmiConnector = connectors[0];
        if (wagmiConnector) {
          connect({ connector: wagmiConnector });
        }
      }
    } catch (err: unknown) {
      // User rejected the request — ignore
    } finally {
      setIsPending(false);
    }
  }, [ connect, connectors ]);

  const openModal = React.useCallback(() => {
    handleConnect();
  }, [ handleConnect ]);

  return {
    isOpen: isPending,
    open: handleConnect,
    close: disconnect,
    connect: handleConnect,
    disconnect,
    openModal,
    address: address as string | undefined,
    isConnected,
    isReconnecting: isReconnecting ?? false,
  };
}
