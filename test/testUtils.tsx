import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render } from "@testing-library/react";
import { I18nProvider } from "../src/i18n";
import { routes } from "../src/router";

export function renderAppAt(path: string) {
  const memoryRouter = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <I18nProvider>
      <RouterProvider router={memoryRouter} />
    </I18nProvider>,
  );
}
