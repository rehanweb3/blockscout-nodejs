export default function useAccountWithDomain() {
  return {
    address: undefined as string | undefined,
    domain: undefined as string | undefined,
    isConnected: false,
  };
}
