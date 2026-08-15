import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../../i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "../ui/ThemeToggle";
import type { Dictionary } from "../../i18n/en";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const NAV_ITEMS = [
  { id: "nav-home", labelKey: "nav.home", targetId: "hero" },
  { id: "nav-about", labelKey: "nav.about", targetId: "about" },
  { id: "nav-clients", labelKey: "nav.clients", targetId: "clients" },
  { id: "nav-equipment", labelKey: "nav.equipment", targetId: "equipment" },
  { id: "nav-services", labelKey: "nav.services", targetId: "services" },
  { id: "nav-portfolio", labelKey: "nav.portfolio", targetId: "portfolio" },
  { id: "nav-contact", labelKey: "nav.contact", targetId: "contact" },
];

export function Nav() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV_ITEMS;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ تحديد إذا كنا في صفحة Portfolio Event
  const isPortfolioPage = location.pathname.startsWith('/portfolio/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ دالة ذكية للتنقل
  const handleNavigation = (targetId: string) => {
    if (isPortfolioPage) {
      // إذا كنا في صفحة Portfolio، نرجع للـ HomePage مع hash
      navigate(`/#${targetId}`);
      // بعد الانتقال، نعمل scroll
      setTimeout(() => {
        scrollToSection(targetId);
      }, 100);
    } else {
      // إذا كنا في HomePage، scroll مباشرة
      scrollToSection(targetId);
    }
    setMobileOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-6 z-[100] flex justify-center px-4 pointer-events-none">
      {/* Desktop Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`hidden md:flex items-center gap-2 rounded-full pointer-events-auto px-3 py-2 transition-all duration-500 ${
          scrolled
            ? "glass shadow-lg"
            : "bg-white/[0.04] backdrop-blur-md border border-white/10"
        }`}
      >
        {items?.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.targetId)}
            className="font-display text-base font-medium px-5 py-2.5 rounded-full text-on-surface/90 hover:text-primary hover:bg-white/5 transition-colors"
          >
            {resolveLabel(t, item.labelKey)}
          </button>
        ))}
        
        <span className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />
        
        <ThemeToggle />
        <LanguageSwitch className="!border-0 !bg-transparent" />
      </motion.nav>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-6 inset-x-4 flex items-center justify-between pointer-events-auto">
        <span className="sr-only">Phoenix Media navigation</span>
        <button
          className={`ms-auto h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 ${
            scrolled ? "glass" : "bg-white/10 backdrop-blur-md"
          } ${mobileOpen ? "bg-primary text-black" : "text-on-surface"}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-1">
            {/* Line 1 */}
            <span 
              className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[0.375rem]" : ""
              }`}
            />
            {/* Line 2 */}
            <span 
              className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            {/* Line 3 */}
            <span 
              className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[0.375rem]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="md:hidden fixed top-20 inset-x-4 glass rounded-2xl overflow-hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-1 p-3">
              {items?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.targetId);
                    setMobileOpen(false); // ✅ إغلاق بعد الضغط
                  }}
                  className="text-start font-display text-base py-3 px-4 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
                >
                  {resolveLabel(t, item.labelKey)}
                </button>
              ))}
              
              <div className="flex items-center gap-3 px-4 py-3 border-t border-glass-border mt-2">
                {/* ✅ إغلاق عند تغيير Theme */}
                <div onClick={() => setMobileOpen(false)}>
                  <ThemeToggle showLabel />
                </div>
                
                {/* ✅ إغلاق عند تغيير اللغة */}
                <div className="flex-1" onClick={() => setMobileOpen(false)}>
                  <LanguageSwitch className="flex-1" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}

function resolveLabel(t: Dictionary, path: string): string {
  const parts = path.split(".");
  let cursor: unknown = t;
  for (const part of parts) {
    cursor = (cursor as Record<string, unknown>)?.[part];
  }
  return typeof cursor === "string" ? cursor : path;
}