export default function useRewardsActivity() {
  return {
    trackContract: async (_address: string) => undefined,
    trackTransaction: async (_account: string, _address: string) => undefined,
    trackTransactionConfirm: async (_hash: string, _token: string) => undefined,
  };
}
