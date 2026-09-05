import { createBrowserRouter, RouterProvider, Outlet, type RouteObject, Navigate  } from "react-router-dom";
import { Suspense, lazy } from "react";

// Public Page (loaded eagerly: the homepage must render immediately)
import HomePage from "./public-pages/HomePage";
import PortfolioEventPage from "./public-pages/PortfolioEventPage";

// Auth Pages (lazy: not needed unless the admin area is visited)
const LoginPage = lazy(() => import("./admin/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./admin/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./admin/pages/auth/ResetPasswordPage"));

// Admin Pages (lazy: not needed unless the admin area is visited)
const HeroAdminPage = lazy(() => import("./admin/pages/HeroAdminPage"));
const AboutAdminPage = lazy(() => import("./admin/pages/AboutAdminPage"));
const ClientsAdminPage = lazy(() => import("./admin/pages/ClientsAdminPage"));
const EquipmentAdminPage = lazy(() => import("./admin/pages/EquipmentAdminPage"));
const ServicesAdminPage = lazy(() => import("./admin/pages/ServicesAdminPage"));
const PortfolioAdminListPage = lazy(() => import("./admin/pages/PortfolioAdminListPage"));
const PortfolioAdminEditPage = lazy(() => import("./admin/pages/PortfolioAdminEditPage"));
const ContactAdminPage = lazy(() => import("./admin/pages/ContactAdminPage"));
const SocialAdminPage = lazy(() => import("./admin/pages/SocialAdminPage"));
const SeoAdminPage = lazy(() => import("./admin/pages/SeoAdminPage"));
const LanguageAdminPage = lazy(() => import("./admin/pages/LanguageAdminPage"));
const SettingsAdminPage = lazy(() => import("./admin/pages/SettingsAdminPage"));
const DashboardPage = lazy(() => import("./admin/pages/DashboardPage"));
const MessagesAdminPage = lazy(() => import("./admin/pages/MessagesAdminPage"));

// Layout & Guards
import { AuthGuard } from "./admin/layout/AuthGuard";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { isAuthenticated } from "./services/apiClient";

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}


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
      <AdminSuspense>
        <AuthRedirect>
          <LoginPage />
        </AuthRedirect>
      </AdminSuspense>
    ),
    errorElement: <RouteErrorFallback /> 
  },
  { 
    path: "/admin/auth/forgot-password", 
    element: (
      <AdminSuspense>
        <AuthRedirect>
          <ForgotPasswordPage />
        </AuthRedirect>
      </AdminSuspense>
    ),
    errorElement: <RouteErrorFallback /> 
  },
  { 
    path: "/admin/auth/reset-password", 
    element: (
      <AdminSuspense>
        <ResetPasswordPage />
      </AdminSuspense>
    ),
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
    element: (
      <AdminSuspense>
        <ProtectedAdminShell />
      </AdminSuspense>
    ),
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