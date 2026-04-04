import { GrowthBook } from '@growthbook/growthbook-react';

export function initGrowthBook(_uuid?: string) {
  return new GrowthBook({
    apiHost: '',
    clientKey: process.env.NEXT_PUBLIC_GROWTH_BOOK_CLIENT_KEY || '',
    enableDevMode: process.env.NODE_ENV === 'development',
    attributes: { id: _uuid || '' },
  });
}
