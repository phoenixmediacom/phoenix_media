import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useHeroProgress } from "../../components/layout/HeroProgressContext";
import { useAsync } from "../../hooks/useAsync";
import { getHero } from "../../services/endpoints/hero";
import { SocialIcons } from "../../components/layout/SocialIcons";

export function BrandCorner() {
  const progress = useHeroProgress();
  const { data: hero } = useAsync(() => getHero(), []);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ إظهار/إخفاء زر العودة للأعلى
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ دالة العودة للأعلى
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (progress < 0.05 || !hero) return null;

  return (
    <>
      {/* الشعار في اليسار */}
      <motion.div
        className="fixed z-40 bottom-8 start-8 flex items-center gap-3 pointer-events-none"
        style={{ opacity: progress }}
      >
        <img src={hero.logoUrl} alt={hero.companyName} className="h-10 w-10 object-contain" />
        <span className="font-display font-bold text-on-surface hidden sm:inline">
          {hero.companyName}
        </span>
      </motion.div>

      {/* أيقونات التواصل الاجتماعي في اليمين */}
      <motion.div
        className="fixed z-40 bottom-8 end-8 pointer-events-auto"
        style={{ opacity: progress }}
      >
        <SocialIcons />
      </motion.div>

      {/* ✅ زر العودة للأعلى - فوق أيقونات السوشيال ميديا */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-24 end-8 z-50 h-12 w-12 rounded-full glass border-2 border-white/20 text-primary shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-primary/50 group backdrop-blur-xl"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}