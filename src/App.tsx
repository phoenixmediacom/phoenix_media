import { I18nProvider } from "./i18n";
import { AppRouter } from "./router";

export default function App() {
  return (
    <I18nProvider>
      <AppRouter />
    </I18nProvider>
  );
}
