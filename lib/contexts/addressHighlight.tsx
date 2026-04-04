import React from 'react';

interface AddressHighlightContextValue {
  highlightedAddress: string | null;
  onMouseEnter: (address: string) => void;
  onMouseLeave: () => void;
}

const AddressHighlightContext = React.createContext<AddressHighlightContextValue>({
  highlightedAddress: null,
  onMouseEnter: () => {},
  onMouseLeave: () => {},
});

export function AddressHighlightProvider({ children }: React.PropsWithChildren) {
  const [ highlightedAddress, setHighlightedAddress ] = React.useState<string | null>(null);

  const onMouseEnter = React.useCallback((address: string) => setHighlightedAddress(address), []);
  const onMouseLeave = React.useCallback(() => setHighlightedAddress(null), []);

  return (
    <AddressHighlightContext.Provider value={{ highlightedAddress, onMouseEnter, onMouseLeave }}>
      {children}
    </AddressHighlightContext.Provider>
  );
}

export function useAddressHighlightContext() {
  return React.useContext(AddressHighlightContext);
}
