import React from 'react';

interface SocketContextValue {
  socket: null;
  isConnected: boolean;
}

const SocketContext = React.createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children, url }: React.PropsWithChildren<{ url?: string }>) {
  return (
    <SocketContext.Provider value={{ socket: null, isConnected: false }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return React.useContext(SocketContext);
}
