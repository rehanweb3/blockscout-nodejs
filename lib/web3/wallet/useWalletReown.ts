export default function useWalletReown() {
  return {
    address: undefined as string | undefined,
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    signMessage: async (_msg: string) => '',
  };
}
