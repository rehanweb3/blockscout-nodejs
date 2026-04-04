import React from 'react';

type ColorTheme = 'light' | 'dark' | 'dim';

interface SettingsContextValue {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  tableView: boolean;
  setTableView: (val: boolean) => void;
}

const SettingsContext = React.createContext<SettingsContextValue>({
  colorTheme: 'light',
  setColorTheme: () => {},
  tableView: false,
  setTableView: () => {},
});

export function SettingsContextProvider({ children }: React.PropsWithChildren) {
  const [ colorTheme, setColorTheme ] = React.useState<ColorTheme>('light');
  const [ tableView, setTableView ] = React.useState(false);

  return (
    <SettingsContext.Provider value={{ colorTheme, setColorTheme, tableView, setTableView }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  return React.useContext(SettingsContext);
}
