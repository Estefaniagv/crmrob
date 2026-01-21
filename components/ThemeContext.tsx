import * as React from "react";
import { safeGetLocalStorage, safeSetLocalStorage } from "./storage";

const THEME_KEY = "crm.theme.darkMode";

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = React.useState(false);

  React.useEffect(() => {
    const saved = safeGetLocalStorage(THEME_KEY);
    if (saved === "true") setDarkModeState(true);
    if (saved === "false") setDarkModeState(false);
  }, []);

  const setDarkMode = React.useCallback((v: boolean) => {
    setDarkModeState(v);
    safeSetLocalStorage(THEME_KEY, String(v));
    const root = document.documentElement;
    root.classList.toggle("dark", v);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return;
      if (e.newValue === "true") setDarkModeState(true);
      if (e.newValue === "false") setDarkModeState(false);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [darkMode]);

  const toggle = React.useCallback(() => setDarkMode(!darkMode), [darkMode, setDarkMode]);

  return <ThemeContext.Provider value={{ darkMode, setDarkMode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

