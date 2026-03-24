import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "@/i18n/en.json";
import de from "@/i18n/de.json";

type Locale = "en" | "de";

const translations: Record<Locale, Record<string, any>> = { en, de };

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

function resolve(obj: Record<string, any>, path: string): string {
  return (path.split(".").reduce((o, k) => o?.[k], obj) as string | undefined) ?? path;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("locale") as Locale | null;
  if (stored === "en" || stored === "de") return stored;
  return window.navigator.language.startsWith("de") ? "de" : "en";
}

function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  let str = resolve(translations[locale], key);
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}

const fallbackContext: LanguageContextType = {
  locale: getInitialLocale(),
  setLocale: (l) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", l);
    }
  },
  t: (key, vars) => translate(getInitialLocale(), key, vars),
};

const LanguageContext = createContext<LanguageContextType>(fallbackContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", l);
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
