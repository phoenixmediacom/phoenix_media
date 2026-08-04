import { createBrowserRouter, RouterProvider, Outlet, type RouteObject } from "react-router-dom";
import HomePage from "./public-pages/HomePage";
import PortfolioEventPage from "./public-pages/PortfolioEventPage";
import LoginPage from "./admin/pages/LoginPage";
import DashboardPage from "./admin/pages/DashboardPage";
import HeroAdminPage from "./admin/pages/HeroAdminPage";
import AboutAdminPage from "./admin/pages/AboutAdminPage";
import ClientsAdminPage from "./admin/pages/ClientsAdminPage";
import EquipmentAdminPage from "./admin/pages/EquipmentAdminPage";
import ServicesAdminPage from "./admin/pages/ServicesAdminPage";
import PortfolioAdminListPage from "./admin/pages/PortfolioAdminListPage";
import PortfolioAdminEditPage from "./admin/pages/PortfolioAdminEditPage";
import ContactAdminPage from "./admin/pages/ContactAdminPage";
import SocialAdminPage from "./admin/pages/SocialAdminPage";
import NavigationAdminPage from "./admin/pages/NavigationAdminPage";
import SeoAdminPage from "./admin/pages/SeoAdminPage";
import LanguageAdminPage from "./admin/pages/LanguageAdminPage";
import SettingsAdminPage from "./admin/pages/SettingsAdminPage";
import { AuthGuard } from "./admin/layout/AuthGuard";
import { AdminLayout } from "./admin/layout/AdminLayout";

function ProtectedAdminShell() {
  return (
    <AuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AuthGuard>
  );
}

function RouteErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface gap-4 px-6 text-center">
      <h1 className="font-display text-headline-md">Something went wrong</h1>
      <p className="text-on-surface-variant max-w-md">
        This page hit an unexpected error. Try reloading, or head back to the homepage.
      </p>
      <a href="/" className="text-primary underline">
        Return home
      </a>
    </div>
  );
}

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage />, errorElement: <RouteErrorFallback /> },
  {
    path: "/portfolio/:slug",
    element: <PortfolioEventPage />,
    errorElement: <RouteErrorFallback />,
  },
  { path: "/admin/login", element: <LoginPage />, errorElement: <RouteErrorFallback /> },
  {
    path: "/admin",
    element: <ProtectedAdminShell />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "hero", element: <HeroAdminPage /> },
      { path: "about", element: <AboutAdminPage /> },
      { path: "clients", element: <ClientsAdminPage /> },
      { path: "equipment", element: <EquipmentAdminPage /> },
      { path: "services", element: <ServicesAdminPage /> },
      { path: "portfolio", element: <PortfolioAdminListPage /> },
      { path: "portfolio/:id", element: <PortfolioAdminEditPage /> },
      { path: "contact", element: <ContactAdminPage /> },
      { path: "social", element: <SocialAdminPage /> },
      { path: "navigation", element: <NavigationAdminPage /> },
      { path: "seo", element: <SeoAdminPage /> },
      { path: "language", element: <LanguageAdminPage /> },
      { path: "settings", element: <SettingsAdminPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
