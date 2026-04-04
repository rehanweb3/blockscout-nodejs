import React from 'react';

const MarketplaceContext = React.createContext({});

export function MarketplaceContextProvider({ children }: React.PropsWithChildren) {
  return (
    <MarketplaceContext.Provider value={{}}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext() {
  return React.useContext(MarketplaceContext);
}
