import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ThemeContextType = {
  theme: string
  isLight: boolean
  toggleTheme:() => any
}

const Context = createContext<ThemeContextType>({
  theme: 'light',
  isLight: true,
  toggleTheme: () => {}
});

export const useThemeContext = () => useContext(Context);

export default function ThemeContext({ children }:{children:any}): JSX.Element {
  const [theme, setTheme] = useState('light');

  const isLight = useMemo(() => theme === 'light', [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return <Context.Provider value={{ theme, isLight, toggleTheme }}>{children}</Context.Provider>;
}
