const BACKEND_URL = process.env.NEXT_PUBLIC_API_HOST || '';

const getChainConfigValue = (key: 'rpcUrl' | 'wsUrl' | 'chainId'): string => {
  // Client-side: use the value injected by _document.tsx from the backend.
  if (typeof window !== 'undefined') {
    const chainCfg = (window as Window & { __CHAIN_CONFIG__?: Record<string, string> }).__CHAIN_CONFIG__;
    if (chainCfg && chainCfg[key]) return chainCfg[key];
  }
  // Server-side (SSR) fallback: private env vars (no NEXT_PUBLIC_ prefix — not bundled to client).
  // These mirror server/.env values and are set in .env.local without NEXT_PUBLIC_ so they are
  // available in server-side Next.js code paths but never shipped in browser bundles.
  if (key === 'rpcUrl') return process.env.NETWORK_RPC_URL || '';
  if (key === 'wsUrl') return process.env.NETWORK_WS_URL || '';
  if (key === 'chainId') return process.env.NEXT_PUBLIC_NETWORK_ID || '1';
  return '';
};

const config = {
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_HOST || '',
    envFilePath: '',
  },

  apis: {
    general: {
      endpoint: BACKEND_URL,
      basePath: '/api/v2',
      socket: getChainConfigValue('wsUrl') || null,
      socketNamespace: undefined as string | undefined,
    },
    rewards: {
      endpoint: null as string | null,
      basePath: '',
    },
    bens: {
      endpoint: null as string | null,
      basePath: '',
    },
    stats: {
      endpoint: null as string | null,
      basePath: '',
    },
    visualizer: {
      endpoint: null as string | null,
      basePath: '',
    },
    nameService: {
      endpoint: null as string | null,
      basePath: '',
    },
    multichain: {
      endpoint: null as string | null,
      basePath: '',
    },
  },

  UI: {
    fonts: {
      body: { name: 'Inter, InterFallback', url: null as string | null } as { name?: string; url?: string | null } | null,
      heading: { name: 'Poppins', url: null as string | null } as { name?: string; url?: string | null } | null,
    },
    maintenanceAlert: {
      message: null as string | null,
    },
    apiKeysAlert: {
      message: null as string | null,
    },
    indexingAlert: {
      blocks: { isEnabled: false } as { isEnabled: boolean },
      txs: { isEnabled: false } as { isEnabled: boolean },
      intTxs: { isHidden: true } as { isHidden: boolean },
    },
    maxContentWidth: undefined as number | undefined,
    nativeCoinPrice: { coinGeckoId: null as string | null } as { coinGeckoId: string | null } | null,
    explorers: [] as Array<{ title: string; baseUrl: string; logo: string | null; type: string }>,
    featuredNetworks: { items: null as Array<unknown> | null } as { items: Array<unknown> | null } | null,
    hasContractAuditReports: false,
    ides: { items: [] as Array<unknown> },
    homepage: {
      charts: [ 'daily_txs' ] as Array<string>,
      plate: { background: '#1a1b1f', textColor: '' },
      highlights: [] as Array<unknown>,
      stats: [
        'total_blocks',
        'average_block_time',
        'total_txs',
        'wallet_addresses',
        'gas_tracker',
      ] as Array<string>,
    },
    navigation: {
      logo: { image: null as string | null, dark: null as string | null },
      icon: { image: null as string | null, dark: null as string | null },
      highlightedRoutes: [] as Array<string>,
    },
    views: {
      block: { hiddenFields: [] as Array<string> },
      address: {
        identiconType: 'blockie' as string,
        hashFormat: {
          availableFormats: [] as Array<string>,
          defaultFormat: 'base16' as string,
        },
        extraVerificationMethods: [] as Array<string>,
      },
      contract: { additionalSources: false, solidityscanEnabled: false },
      tx: { hiddenFields: [] as Array<string>, additionalFields: [] as Array<string> },
      nft: { mediaViewer: { maxSize: 25 } },
      token: { hideScamTokensEnabled: false },
    },
    sidebar: {
      hiddenLinks: undefined as Array<string> | undefined,
      otherLinks: [] as Array<unknown>,
      featuredNetworks: null as string | null,
    },
    footer: {
      links: null as string | null,
    },
    ad: {
      adBannerProvider: 'none' as string,
      adTextProvider: 'none' as string,
    },
    colorTheme: { hex: '' } as { hex: string } | null,
  },

  chain: {
    name: process.env.NEXT_PUBLIC_NETWORK_NAME || 'Blockscout Explorer',
    shortName: process.env.NEXT_PUBLIC_NETWORK_SHORT_NAME || 'BSE',
    id: process.env.NEXT_PUBLIC_NETWORK_ID || '1',
    rpcUrl: getChainConfigValue('rpcUrl') || null,
    rpcUrls: [] as Array<string>,
    currency: {
      name: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_NAME || 'Ether',
      weiName: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_WEI_NAME || 'Wei',
      symbol: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL || 'ETH',
      decimals: Number(process.env.NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS || '18'),
    },
    secondaryCoin: {
      symbol: process.env.NEXT_PUBLIC_NETWORK_SECONDARY_COIN_SYMBOL || null,
    },
    governanceToken: {
      symbol: process.env.NEXT_PUBLIC_NETWORK_GOVERNANCE_TOKEN_SYMBOL || null,
      address: process.env.NEXT_PUBLIC_NETWORK_GOVERNANCE_TOKEN_ADDRESS || null,
    },
    tokenStandard: process.env.NEXT_PUBLIC_NETWORK_TOKEN_STANDARD || 'ERC',
    additionalTokenTypes: [] as Array<{ id: string; title: string }>,
    hasMultipleGasCurrencies: false,
    verificationType: 'none' as string,
    isTestnet: process.env.NEXT_PUBLIC_IS_TESTNET === 'true',
  },

  features: {
    account: { isEnabled: false },
    address3rdPartyWidgets: { isEnabled: false },
    addressMetadata: { isEnabled: false },
    addressProfileAPI: { isEnabled: false },
    addressVerification: { isEnabled: false },
    ads: { isEnabled: false, provider: 'none' },
    adsBanner: { isEnabled: false, provider: 'none', isSpecifyEnabled: false },
    adsText: { isEnabled: false, provider: 'none' },
    advancedFilter: { isEnabled: false },
    apiDocs: { isEnabled: true, tabs: [ 'rest_api' ] as Array<string>, alertMessage: null as string | null },
    arbitrumRollup: { isEnabled: false },
    beaconChain: { isEnabled: false },
    blobs: { isEnabled: false },
    blockchainInteraction: { isEnabled: true, connectorType: 'metamask' as string },
    bridgedTokens: { isEnabled: false },
    celo: { isEnabled: false },
    crossChainTxs: { isEnabled: false },
    csvExport: { isEnabled: false },
    dataAvailability: { isEnabled: false },
    deFiDropdown: { isEnabled: false },
    easterEggBadge: { isEnabled: false },
    easterEggPuzzleBadge: { isEnabled: false },
    ens: { isEnabled: false },
    externalTxs: { isEnabled: false },
    faultProofSystem: { isEnabled: false },
    fheops: { isEnabled: false },
    flashblocks: { isEnabled: false },
    gasTracker: { isEnabled: true, units: [ 'gwei' ] as Array<'gwei' | 'usd'> },
    getGasButton: { isEnabled: false },
    googleAnalytics: { isEnabled: false },
    graphqlApi: { isEnabled: false },
    hotContracts: { isEnabled: false },
    interopMessaging: { isEnabled: false },
    marketplace: { isEnabled: false, categories: null, securityReports: false, submitForm: null, rating: false },
    megaEth: { isEnabled: false },
    metasuites: { isEnabled: false },
    mixpanel: { isEnabled: false },
    mudFramework: { isEnabled: false },
    mudWorlds: { isEnabled: false },
    multichain: { isEnabled: false },
    multichainButton: { isEnabled: false },
    multisender: { isEnabled: false },
    nameService: { isEnabled: false },
    nameServices: { isEnabled: false },
    opStack: { isEnabled: false },
    pools: { isEnabled: false },
    publicTagsSubmission: { isEnabled: false },
    reputation: { isEnabled: false },
    restApi: { isEnabled: false },
    rewards: { isEnabled: false },
    rollup: { isEnabled: false, type: undefined as string | undefined, homepage: { showLatestBlocks: true } },
    sandbox: { isEnabled: false },
    save_on_gas: { isEnabled: false },
    scroll: { isEnabled: false },
    shibarium: { isEnabled: false },
    sol2uml: { isEnabled: false },
    stats: { isEnabled: false },
    suave: { isEnabled: false },
    swapButton: { isEnabled: false },
    tac: { isEnabled: false },
    tokenInfoSuggestion: { isEnabled: false },
    txInterpretation: { isEnabled: false, provider: 'none' },
    userOps: { isEnabled: false },
    validators: { isEnabled: false },
    verifiedTokens: { isEnabled: false },
    visualizeContracts: { isEnabled: false },
    rollbar: { isEnabled: false, clientToken: '', environment: 'production' },
    watchlist: { isEnabled: false },
    web3Wallet: { isEnabled: false },
    xStarScore: { isEnabled: false },
    zetachain: { isEnabled: false },
    zkEvmRollup: { isEnabled: false },
    zkSyncRollup: { isEnabled: false },
  },

  meta: {
    seo: {
      enhancedDataEnabled: false,
    },
    promoteBlockscoutInTitle: true,
    og: {
      description: '',
      imageUrl: '',
    },
  },

  growth: {
    isEnabled: false,
  },

  account: {
    authUrl: null as string | null,
  },

  rewards: {
    api: {
      endpoint: null as string | null,
    },
  },

  services: {
    reCaptchaV2: {
      siteKey: process.env.NEXT_PUBLIC_RE_CAPTCHA_APP_SITE_KEY || null,
    },
    googleFonts: { isEnabled: false },
    mixpanel: { isEnabled: false },
    googleAnalytics: { isEnabled: false },
  },
};

export default config;
