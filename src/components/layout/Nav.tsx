import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listNavItems } from "../../services/endpoints/navigation";
import { LanguageSwitch } from "./LanguageSwitch";
import type { Dictionary } from "../../i18n/en";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Nav() {
  const { t } = useI18n();
  const { data: items } = useAsync(() => listNavItems(true), []);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-6 z-[100] flex justify-center px-4 pointer-events-none">
      {/* Desktop: centered pill, very transparent so the hero video reads through it */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`hidden md:flex items-center gap-2 rounded-full pointer-events-auto px-3 py-2 transition-all duration-500 ${
          scrolled
            ? "bg-surface/50 backdrop-blur-xl border border-glass-border shadow-lg"
            : "bg-white/[0.04] backdrop-blur-md border border-white/10"
        }`}
      >
        {items?.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.targetId)}
            className="font-display text-base font-medium px-5 py-2.5 rounded-full text-on-surface/90 hover:text-primary hover:bg-white/5 transition-colors"
          >
            {resolveLabel(t, item.labelKey)}
          </button>
        ))}
        <span className="w-px h-6 bg-white/10 mx-1" aria-hidden="true" />
        <LanguageSwitch className="!border-0 !bg-transparent" />
      </motion.nav>

      {/* Mobile: compact pill with hamburger, top-start */}
      <div className="md:hidden fixed top-6 inset-x-4 flex items-center justify-between pointer-events-auto">
        <span className="sr-only">Phoenix Media navigation</span>
        <button
          className={`ms-auto h-11 w-11 rounded-full flex items-center justify-center text-on-surface transition-colors ${
            scrolled ? "bg-surface/70 backdrop-blur-xl border border-glass-border" : "bg-white/10 backdrop-blur-md"
          }`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="md:hidden fixed top-20 inset-x-4 bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-1 p-3">
              {items?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.targetId);
                    setMobileOpen(false);
                  }}
                  className="text-start font-display text-base py-3 px-4 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
                >
                  {resolveLabel(t, item.labelKey)}
                </button>
              ))}
              <LanguageSwitch className="self-start mt-2 mx-4 mb-2" />
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
