import { motion } from "framer-motion";
import { useHeroProgress } from "../../components/layout/HeroProgressContext";
import { useAsync } from "../../hooks/useAsync";
import { getHero } from "../../services/endpoints/hero";
import { SocialIcons } from "../../components/layout/SocialIcons";

export function BrandCorner() {
  const progress = useHeroProgress();
  const { data: hero } = useAsync(() => getHero(), []);
  if (progress < 0.05 || !hero) return null;

  return (
    <>
      <motion.div
        className="fixed z-40 bottom-8 start-8 flex items-center gap-3 pointer-events-none"
        style={{ opacity: progress }}
      >
        <img src={hero.logoUrl} alt={hero.companyName} className="h-10 w-10 object-contain" />
        <span className="font-display font-bold text-on-surface hidden sm:inline">
          {hero.companyName}
        </span>
      </motion.div>
      <motion.div
        className="fixed z-40 bottom-8 end-8 pointer-events-auto"
        style={{ opacity: progress }}
      >
        <SocialIcons />
      </motion.div>
    </>
  );
}
