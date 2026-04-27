import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Locale, translations, Dict, formatPrice } from "./translations";

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  formatPrice: (n: number) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE_KEY = "zo_locale";

const detectInitial = (): Locale => {
  if (typeof window === "undefined") return "sr-Latn";
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && translations[saved]) return saved;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("en")) return "en";
  // Serbian default (Latin) — most diaspora users expect Latin
  return "sr-Latn";
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("sr-Latn");

  useEffect(() => {
    setLocaleState(detectInitial());
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  };

  useEffect(() => {
    const htmlLang =
      locale === "sr-Cyrl" ? "sr-Cyrl"
      : locale === "sr-Latn" ? "sr-Latn"
      : locale;
    document.documentElement.lang = htmlLang;
    const t = translations[locale];
    document.title = t.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t.meta.description);
  }, [locale]);

  const value = useMemo<I18nCtx>(
    () => ({
      locale,
      setLocale,
      t: translations[locale],
      formatPrice: (n: number) => formatPrice(n, locale),
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};