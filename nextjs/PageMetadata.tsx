import Head from 'next/head';
import React from 'react';

import config from 'configs/app';

interface PageMetadataProps {
  pathname: string;
  query?: Record<string, unknown>;
  apiData?: unknown;
}

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/blocks': 'Blocks',
  '/txs': 'Transactions',
  '/addresses': 'Addresses',
  '/tokens': 'Tokens',
  '/address/[hash]': 'Address',
  '/block/[height_or_hash]': 'Block',
  '/tx/[hash]': 'Transaction',
  '/token/[hash]': 'Token',
  '/search-results': 'Search Results',
  '/verified-contracts': 'Verified Contracts',
};

export default function PageMetadata({ pathname }: PageMetadataProps) {
  const pageTitle = TITLES[pathname] || 'Explorer';
  const networkName = config.chain.name;
  const title = `${pageTitle} | ${networkName}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={`${networkName} - Blockchain Explorer`}/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="icon" href="/favicon.ico"/>
    </Head>
  );
}
