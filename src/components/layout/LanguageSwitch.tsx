import { useI18n } from "../../i18n";

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const other = locale === "en" ? "ar" : "en";
  const label = locale === "en" ? "العربية" : "English";

  return (
    <button
      onClick={() => setLocale(other)}
      className={`font-mono-label text-label-sm uppercase rounded-full px-3 py-1.5 border border-glass-border text-on-surface hover:text-primary hover:border-primary transition-colors ${className}`}
      aria-label={`Switch to ${other === "ar" ? "Arabic" : "English"}`}
    >
      {label}
    </button>
  );
}
