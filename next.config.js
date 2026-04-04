const path = require('path');

const stubsDir = path.resolve(__dirname, 'stubs');

const stubAliases = {
  '@dynamic-labs/sdk-react-core': path.join(stubsDir, 'dynamic-labs-sdk-react-core.js'),
  '@dynamic-labs/ethereum': path.join(stubsDir, 'dynamic-labs-ethereum.js'),
  '@dynamic-labs/wagmi-connector': path.join(stubsDir, 'dynamic-labs-wagmi-connector.js'),
  'react-google-recaptcha': path.join(stubsDir, 'react-google-recaptcha.js'),
  'gradient-avatar': path.join(stubsDir, 'gradient-avatar.js'),
  'blo': path.join(stubsDir, 'blo.js'),
  'react-jazzicon': path.join(stubsDir, 'react-jazzicon.js'),
  '@nouns/assets': path.join(stubsDir, 'nouns-assets.js'),
  '@nouns/sdk': path.join(stubsDir, 'nouns-sdk.js'),
  '@slise/embed-react': path.join(stubsDir, 'slise-embed-react.js'),
  '@specify-sh/sdk': path.join(stubsDir, 'specify-sh-sdk.js'),
  'brotli-compress/js': path.resolve(__dirname, 'node_modules/brotli-compress/js.js'),
  '@helia/verified-fetch': path.join(stubsDir, 'helia-verified-fetch.js'),
  'graphiql': path.join(stubsDir, 'graphiql.js'),
  '@graphiql/toolkit': path.join(stubsDir, 'graphiql-toolkit.js'),
  '@graphiql/react': path.join(stubsDir, 'graphiql.js'),
  'monaco-graphql': path.join(stubsDir, 'graphiql.js'),
  '@multisender.app/multisender-react-widget': path.join(stubsDir, 'multisender-widget.js'),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: [
      'react-icons',
      '@chakra-ui/react',
      '@ark-ui/react',
      'framer-motion',
      'd3',
      'viem',
      'wagmi',
      '@wagmi/core',
      'es-toolkit',
    ],
  },

  allowedDevOrigins: [ '*.replit.dev', '*.sisko.replit.dev', '*.repl.co' ],

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/v2/:path*',
        destination: `${backendUrl}/api/v2/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`,
      },
    ];
  },

  webpack(config, { isServer, dev }) {
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.toString().includes('svg'),
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: { icon: true, svgProps: { fill: 'currentColor' } },
        },
      ],
    });

    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = { ...config.resolve.alias, ...stubAliases };

    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            defaultVendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            chakra: {
              name: 'chakra',
              test: /[\\/]node_modules[\\/](@chakra-ui|@ark-ui|@emotion)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            web3: {
              name: 'web3',
              test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi|@reown|@tanstack)[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](d3|d3-sankey|framer-motion)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            editors: {
              name: 'editors',
              test: /[\\/]node_modules[\\/](@monaco-editor|graphiql|graphql|swagger-ui-react)[\\/]/,
              chunks: 'async',
              priority: 20,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
