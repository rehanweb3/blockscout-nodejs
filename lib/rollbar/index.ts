import React from 'react';

export function useRollbar() {
  return {
    log: (_msg: string) => {},
    error: (_msg: string) => {},
    warn: (_msg: string) => {},
    info: (_msg: string) => {},
  };
}

export const RollbarContext = React.createContext<ReturnType<typeof useRollbar> | null>(null);

export function RollbarProvider({ children }: React.PropsWithChildren) {
  const rollbar = useRollbar();
  return React.createElement(RollbarContext.Provider, { value: rollbar }, children);
}
