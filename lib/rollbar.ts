import React from 'react';

export const clientConfig = {};

export function Provider({ children, config: _config }: React.PropsWithChildren<{ config: Record<string, unknown> }>) {
  return React.createElement(React.Fragment, null, children);
}

export function useRollbar() {
  return {
    log: (_msg: string) => {},
    error: (_msg: string) => {},
    warn: (_msg: string) => {},
    info: (_msg: string) => {},
    configure: (_config: Record<string, unknown>) => {},
  };
}
