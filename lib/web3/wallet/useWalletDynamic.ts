export default function useWalletDynamic() {
  return {
    address: undefined as string | undefined,
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
  };
}
