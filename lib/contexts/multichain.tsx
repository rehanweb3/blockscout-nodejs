import React from 'react';

interface MultichainContextValue {
  isEnabled: boolean;
  chains: Array<unknown>;
}

const MultichainContext = React.createContext<MultichainContextValue>({
  isEnabled: false,
  chains: [],
});

export function useMultichainContext() {
  return React.useContext(MultichainContext);
}

export function MultichainContextProvider({ children }: React.PropsWithChildren) {
  return (
    <MultichainContext.Provider value={{ isEnabled: false, chains: [] }}>
      {children}
    </MultichainContext.Provider>
  );
}
