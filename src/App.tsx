import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./contexts/ThemeContext"; // ✅ إضافة
import { AppRouter } from "./router";
import { SeoHead } from "./components/layout/SeoHead";

export default function App() {
  return (
    <ThemeProvider> {/* ✅ إضافة */}
      <I18nProvider>
        <SeoHead />
        <AppRouter />
      </I18nProvider>
    </ThemeProvider>
  );
}
