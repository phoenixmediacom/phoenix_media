import { useState, type PropsWithChildren } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { LanguageSwitch } from "../../components/layout/LanguageSwitch";
import { ThemeToggle } from "../../components/ui/ThemeToggle"; // ✅ إضافة
import { logout } from "../../services/endpoints/auth";
import { useIdleTimer } from "../../hooks/useIdleTimer";

export function AdminLayout({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleAutoLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Auto logout error:", err);
    } finally {
      navigate("/admin/auth/login", { 
        state: { message: "تم تسجيل الخروج تلقائياً لعدم النشاط لمدة 30 دقيقة." } 
      });
    }
  };

  useIdleTimer({
    onIdle: handleAutoLogout,
    timeoutInMinutes: 30,
  });

  return (
    <div className="min-h-screen flex bg-surface text-on-surface">
      <div className="hidden lg:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 start-0 w-72">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-glass-border flex items-center justify-between px-4 md:px-8 glass sticky top-0 z-20">
          <button
            className="lg:hidden text-on-surface"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          
          <div className="flex-1" />
          
          <Link
            to="/"
            target="_blank"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors me-4"
          >
            View site ↗
          </Link>
          
          {/* ✅ Theme Toggle */}
          <ThemeToggle className="me-3" />
          
          <LanguageSwitch />
        </header>
        
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}