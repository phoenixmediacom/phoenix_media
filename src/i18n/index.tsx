import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { en, type Dictionary } from "./en";
import { ar } from "./ar";
import { getLanguageOverrides } from "../services/endpoints/language";

export type Locale = "en" | "ar";

const baseDictionaries: Record<Locale, Dictionary> = { en, ar };
const STORAGE_KEY = "phoenix-media:locale";

function setDeep(target: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

function applyOverrides(dict: Dictionary, overrides: Record<string, string>): Dictionary {
  const clone = JSON.parse(JSON.stringify(dict)) as Record<string, unknown>;
  for (const [path, value] of Object.entries(overrides)) {
    if (value) setDeep(clone, path, value);
  }
  return clone as unknown as Dictionary;
}

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ar") return stored;
  return window.navigator.language?.startsWith("ar") ? "ar" : "en";
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);
  const [dictionaries, setDictionaries] = useState(baseDictionaries);
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  // Load admin-managed overrides once on mount and whenever they change
  // (the admin Language page calls this same reload after saving).
  useEffect(() => {
    let cancelled = false;
    getLanguageOverrides()
      .then((overrides) => {
        if (cancelled) return;
        setDictionaries({
          en: applyOverrides(en, overrides?.en ?? {}),
          ar: applyOverrides(ar, overrides?.ar ?? {}),
        });
      })
      .catch(() => {
        // No overrides available yet — the static dictionaries are a
        // perfectly valid fallback, so this is not treated as fatal.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir, t: dictionaries[locale], setLocale }),
    [locale, dir, dictionaries],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
