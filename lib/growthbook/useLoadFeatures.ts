import type { GrowthBook } from '@growthbook/growthbook-react';
import React from 'react';

export default function useLoadFeatures(_growthBook: GrowthBook) {
  React.useEffect(() => {
    // Features loading is disabled - no client key configured
  }, []);
}
