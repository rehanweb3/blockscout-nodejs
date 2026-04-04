import config from 'configs/app';

export type NavItemInternal = {
  text: string;
  nextRoute: { pathname: string };
  icon: string;
  isActive?: boolean;
};

export type NavItemExternal = {
  text: string;
  url: string;
  icon?: string;
};

export type NavItem = NavItemInternal | NavItemExternal;

export type NavGroupItem = {
  text: string;
  icon: string;
  isActive?: boolean;
  subItems: Array<NavItem | Array<NavItem>>;
};

export function isInternalItem(item: NavItem | NavGroupItem): item is NavItemInternal {
  return 'nextRoute' in item;
}

export function isGroupItem(item: NavItem | NavGroupItem): item is NavGroupItem {
  return 'subItems' in item;
}

export default function useNavItems(): {
  mainNavItems: Array<NavItem | NavGroupItem>;
  accountNavItems: Array<NavItem>;
} {
  const mainNavItems: Array<NavItem | NavGroupItem> = [
    {
      text: 'Blockchain',
      icon: 'navigation-blockchain',
      subItems: [
        {
          text: 'Transactions',
          nextRoute: { pathname: '/txs' },
          icon: 'navigation-transactions',
        },
        {
          text: 'Internal Transactions',
          nextRoute: { pathname: '/internal-txs' },
          icon: 'navigation-internal_txns',
        },
        {
          text: 'Blocks',
          nextRoute: { pathname: '/blocks' },
          icon: 'navigation-block',
        },
        {
          text: 'Top Accounts',
          nextRoute: { pathname: '/accounts' },
          icon: 'navigation-top_accounts',
        },
        {
          text: 'Verified Contracts',
          nextRoute: { pathname: '/verified-contracts' },
          icon: 'navigation-verified_contracts',
        },
      ],
    },
    {
      text: 'Tokens',
      icon: 'navigation-tokens',
      subItems: [
        {
          text: 'All Tokens',
          nextRoute: { pathname: '/tokens' },
          icon: 'navigation-tokens',
        },
        {
          text: 'Token Transfers',
          nextRoute: { pathname: '/token-transfers' },
          icon: 'navigation-token_transfers',
        },
      ],
    },
    {
      text: 'Charts & Stats',
      icon: 'navigation-stats',
      subItems: [
        {
          text: 'Chain Stats',
          nextRoute: { pathname: '/stats' },
          icon: 'navigation-chain_stats',
        },
        {
          text: 'Gas Tracker',
          nextRoute: { pathname: '/gas-tracker' },
          icon: 'navigation-gas_tracker',
        },
      ],
    },
    {
      text: 'Other',
      icon: 'navigation-other',
      subItems: [
        {
          text: 'Verify Contract',
          nextRoute: { pathname: '/contract-verification' },
          icon: 'navigation-verified_contracts',
        },
      ],
    },
  ];

  const accountNavItems: Array<NavItem> = [];

  return { mainNavItems, accountNavItems };
}
