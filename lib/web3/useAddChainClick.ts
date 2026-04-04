export default function useAddChainClick() {
  return async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await (window.ethereum as any).request({ method: 'wallet_addEthereumChain', params: [] });
      } catch {}
    }
  };
}
