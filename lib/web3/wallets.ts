export const WALLETS_INFO = {
  metamask: {
    name: 'MetaMask',
    icon: 'wallets-metamask',
    url: 'https://metamask.io',
  },
} as const;

export type WalletType = keyof typeof WALLETS_INFO;
