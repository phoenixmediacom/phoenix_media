import React, { createContext, useContext, useState, useEffect } from "react";
import { ar } from "./ar";
import { en, Dictionary } from "./en";
import { Language } from "../services/types";

export interface LanguageContextType {
  lang: Language;
  locale: Language;
  t: Dictionary;
  setLanguage: (lang: Language) => void;
  setLocale: (lang: Language) => void;
  isLoadingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * ✅ تحويل المسارات المسطحة إلى كائن متداخل
 * مثال: { "nav.home": "Alaa" } → { nav: { home: "Alaa" } }
 */
function unflatten(data: Record<string, string>): any {
  const result: any = {};
  
  Object.keys(data).forEach((key) => {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      
      if (i === keys.length - 1) {
        // ✅ آخر مفتاح: ضع القيمة
        current[k] = data[key];
      } else {
        // ✅ مفتاح وسطي: أنشئ كائن إذا لم يكن موجوداً
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
    }
  });
  
  return result;
}

/**
 * ✅ دمج الترجمات (أولوية للقيم من DB)
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      // ✅ القيمة من DB لها الأولوية
      output[key] = source[key];
    }
  });
  
  return output;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>("ar");
  const [isLoadingLanguage, setIsLoadingLanguage] = useState<boolean>(true);
  const [translations, setTranslations] = useState<{ en: Dictionary; ar: Dictionary }>({
    en,
    ar,
  });

  useEffect(() => {
    const fetchLanguageData = async () => {
      try {
        setIsLoadingLanguage(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

        // ✅ 1. جلب اللغة الافتراضية
        let defaultLang: Language = "ar";
        
        try {
          const settingsResponse = await fetch(`${API_BASE_URL}/api/public/settings`, {
            headers: { "Accept": "application/json" },
          });

          if (settingsResponse.ok) {
            const settingsResult = await settingsResponse.json();
            const settings = settingsResult.data || settingsResult;
            
            if (settings.default_language === "ar" || settings.default_language === "en") {
              defaultLang = settings.default_language;
            }
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn("[i18n] Failed to fetch settings:", err);
          }
        }

        // ✅ 2. جلب الترجمات من DB
        try {
          const translationsResponse = await fetch(`${API_BASE_URL}/api/public/translations`, {
            headers: { "Accept": "application/json" },
          });

          if (translationsResponse.ok) {
            const translationsResult = await translationsResponse.json();
            const items = translationsResult.data || [];

            if (Array.isArray(items) && items.length > 0) {
              // ✅ بناء overrides مسطحة
              const flatOverrides: { en: Record<string, string>; ar: Record<string, string> } = {
                en: {},
                ar: {},
              };

              items.forEach((item: any) => {
                if (item.key && item.value) {
                  flatOverrides.en[item.key] = item.value.en || "";
                  flatOverrides.ar[item.key] = item.value.ar || "";
                }
              });

              // ✅ تحويل إلى كائنات متداخلة
              const nestedEn = unflatten(flatOverrides.en);
              const nestedAr = unflatten(flatOverrides.ar);

              // ✅ دمج مع القيم الافتراضية
              const mergedEn = deepMerge(en, nestedEn) as Dictionary;
              const mergedAr = deepMerge(ar, nestedAr) as Dictionary;

              setTranslations({ en: mergedEn, ar: mergedAr });

            }
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("[i18n] Failed to fetch translations:", err);
          }
        }

        // ✅ 3. تطبيق اللغة
        setLang(defaultLang);
        document.dir = defaultLang === "ar" ? "rtl" : "ltr";

      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[i18n] Fatal error:", error);
        }
        setLang("ar");
        document.dir = "rtl";
      } finally {
        setIsLoadingLanguage(false);
      }
    };

    fetchLanguageData();
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      locale: lang, 
      t, 
      setLanguage, 
      setLocale: setLanguage, 
      isLoadingLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

export const useI18n = useTranslation;
export const I18nProvider = LanguageProvider;