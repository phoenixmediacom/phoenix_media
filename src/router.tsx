import { createBrowserRouter, RouterProvider, Outlet, type RouteObject, Navigate  } from "react-router-dom";

// Public Page
import HomePage from "./public-pages/HomePage";
import PortfolioEventPage from "./public-pages/PortfolioEventPage";

// Auth Pages
import LoginPage from "./admin/pages/auth/LoginPage";
import ForgotPasswordPage from './admin/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './admin/pages/auth/ResetPasswordPage';

// Admin Pages
import HeroAdminPage from "./admin/pages/HeroAdminPage";
import AboutAdminPage from "./admin/pages/AboutAdminPage";
import ClientsAdminPage from "./admin/pages/ClientsAdminPage";
import EquipmentAdminPage from "./admin/pages/EquipmentAdminPage";
import ServicesAdminPage from "./admin/pages/ServicesAdminPage";
import PortfolioAdminListPage from "./admin/pages/PortfolioAdminListPage";
import PortfolioAdminEditPage from "./admin/pages/PortfolioAdminEditPage";
import ContactAdminPage from "./admin/pages/ContactAdminPage";
import SocialAdminPage from "./admin/pages/SocialAdminPage";
import SeoAdminPage from "./admin/pages/SeoAdminPage";
import LanguageAdminPage from "./admin/pages/LanguageAdminPage";
import SettingsAdminPage from "./admin/pages/SettingsAdminPage";
import DashboardPage from "./admin/pages/DashboardPage";
import MessagesAdminPage from './admin/pages/MessagesAdminPage';

// Layout & Guards
import { AuthGuard } from "./admin/layout/AuthGuard";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { isAuthenticated } from "./services/apiClient";

/**
 * Protected Admin Shell - wrapper for all admin routes
 */
function ProtectedAdminShell() {
  return (
    <AuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AuthGuard>
  );
}

/**
 * Auth Redirect - إذا كان المستخدم مسجل دخول، يعيد توجيهه للـ dashboard
 */
function AuthRedirect({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

/**
 * Route Error Fallback
 */
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

/**
 * 404 Not Found Page
 */
function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface gap-4 px-6 text-center">
      <h1 className="font-display text-headline-lg">404</h1>
      <p className="text-on-surface-variant max-w-md">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="text-primary underline">
        Return home
      </a>
    </div>
  );
}

export const routes: RouteObject[] = [
  // Public Routes
  { 
    path: "/", 
    element: <HomePage />, 
    errorElement: <RouteErrorFallback /> 
  },
  {
    path: "/portfolio/:slug",
    element: <PortfolioEventPage />,
    errorElement: <RouteErrorFallback />,
  },

  // Auth Routes (غير محمية - مع redirect إذا كان مسجل دخول)
  { 
    path: "/admin/auth/login", 
    element: (
      <AuthRedirect>
        <LoginPage />
      </AuthRedirect>
    ),
    errorElement: <RouteErrorFallback /> 
  },
  { 
    path: "/admin/auth/forgot-password", 
    element: (
      <AuthRedirect>
        <ForgotPasswordPage />
      </AuthRedirect>
    ),
    errorElement: <RouteErrorFallback /> 
  },
  { 
    path: "/admin/auth/reset-password", 
    element: <ResetPasswordPage />,
    errorElement: <RouteErrorFallback /> 
  },

  // Legacy route - redirect old login path
  { 
    path: "/admin/login", 
    element: <Navigate to="/admin/auth/login" replace /> 
  },

  // Protected Admin Routes
  {
    path: "/admin",
    element: <ProtectedAdminShell />,
    errorElement: <RouteErrorFallback />,
    children: [
      // Redirect /admin to /admin/dashboard
      { 
        index: true, 
        element: <Navigate to="/admin/dashboard" replace /> 
      },
      
      // Dashboard
      { 
        path: "dashboard", 
        element: <DashboardPage /> 
      },

      // Content Management
      { 
        path: "hero", 
        element: <HeroAdminPage /> 
      },
      { 
        path: "about", 
        element: <AboutAdminPage /> 
      },
      { 
        path: "clients", 
        element: <ClientsAdminPage /> 
      },
      { 
        path: "equipment", 
        element: <EquipmentAdminPage /> 
      },
      { 
        path: "services", 
        element: <ServicesAdminPage /> 
      },

      // Portfolio
      { 
        path: "portfolio", 
        element: <PortfolioAdminListPage /> 
      },
      { 
        path: "portfolio/:id", 
        element: <PortfolioAdminEditPage /> 
      },

      // Contact & Social
      { 
        path: "contact", 
        element: <ContactAdminPage /> 
      },
      { 
        path: "social", 
        element: <SocialAdminPage /> 
      },

      // Settings
      { 
        path: "seo", 
        element: <SeoAdminPage /> 
      },
      { 
        path: "language", 
        element: <LanguageAdminPage /> 
      },
      { 
        path: "settings", 
        element: <SettingsAdminPage /> 
      },
      { 
        path: "messages", 
        element: <MessagesAdminPage /> 
      },
    ],
  },

  // 404 - Catch all unknown routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// ✅ إصلاح React Router Warning
const router = createBrowserRouter(routes);

export function AppRouter() {
  return (
    <RouterProvider 
      router={router} 
      future={{ 
        v7_startTransition: true 
      }} 
    />
  );
}