interface ChainConfig {
  id: string;
  name: string;
  apiUrl: string;
}

interface MultichainConfig {
  chains: Array<ChainConfig>;
}

const multichainConfig = (): MultichainConfig | null => {
  return null;
};

export default multichainConfig;
