import React from 'react';

export interface AppContextProps {
  pageProps: Record<string, unknown>;
}

const AppContext = React.createContext<AppContextProps>({ pageProps: {} });

export function AppContextProvider({ children, pageProps }: React.PropsWithChildren<{ pageProps: Record<string, unknown> }>) {
  return (
    <AppContext.Provider value={{ pageProps }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return React.useContext(AppContext);
}
