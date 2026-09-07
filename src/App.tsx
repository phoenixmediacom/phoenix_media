import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./contexts/ThemeContext"; // ✅ إضافة
import { AppRouter } from "./router";

export default function App() {
  return (
    <ThemeProvider> {/* ✅ إضافة */}
      <I18nProvider>
        <AppRouter />
      </I18nProvider>
    </ThemeProvider>
  );
}
