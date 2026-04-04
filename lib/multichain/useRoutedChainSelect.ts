export default function useRoutedChainSelect() {
  return {
    selectedChain: null,
    setSelectedChain: (_chain: unknown) => {},
    chains: [],
  };
}
