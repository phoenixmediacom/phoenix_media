import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getPublicEquipment } from "../../services/endpoints/equipment";
import { useEffect, useState } from "react";
import { Section } from "../../components/layout/Section";
import { ErrorState } from "../../components/ui/AsyncStates";
import { LoaderSkeleton } from "../../components/ui/loaders-skeleton";
import { useTheme } from "../../contexts/ThemeContext"; // ✅ إضافة

interface EquipmentItem {
  id: string;
  name: string;
  logoUrl?: string;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

function InfiniteRow({
  items,
  speed = 30,
  reverse = false,
}: {
  items: EquipmentItem[];
  speed?: number;
  reverse?: boolean;
}) {
  if (!items || items.length === 0) return null;

  let baseList = [...items];
  while (baseList.length < 12) {
    baseList = [...baseList, ...items];
  }
  const displayItems = [...baseList, ...baseList];

  const duration = baseList.length * (30 / speed) * 4;

  const initialX = reverse ? "-50%" : "0%";
  const animateX = reverse ? "0%" : "-50%";

  return (
    <div className="relative w-full overflow-hidden py-3" dir="ltr">
      <motion.div
        className="flex w-max gap-8 md:gap-12"
        initial={{ x: initialX }}
        animate={{ x: animateX }}
        transition={{
          x: {
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {displayItems.map((item, i) => (
          <EquipmentLogo key={`${item.id}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

function EquipmentLogo({ item }: { item: EquipmentItem }) {
  const { theme } = useTheme(); // ✅ إضافة
  const [imgError, setImgError] = useState(false);
  const hasImage = item.logoUrl && !imgError;

  return (
    <div 
      className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] md:w-[140px] md:h-[140px] transition-all duration-300 hover:scale-110 group"
      title={item.name}
    >
      {hasImage ? (
        <div className="relative w-full h-full flex items-center justify-center p-3 md:p-4">
          {/* ✅ الشعار */}
          <img
            src={item.logoUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110"
            style={{
              filter: theme === "dark" 
                ? "invert(1) hue-rotate(180deg) brightness(1.1) contrast(0.9)" 
                : "brightness(1) contrast(1)",
              mixBlendMode: theme === "dark" ? "screen" : "multiply",
              opacity: theme === "dark" ? 0.9 : 0.85,
            }}
            loading="lazy"
          />
          
          {/* ✅ Glow على hover */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 to-transparent -z-10" />
        </div>
      ) : (
        <div className="glass rounded-lg px-4 py-2 min-w-[80px] min-h-[60px] flex items-center justify-center">
          <span
            className="text-on-surface-variant text-xs md:text-sm font-mono-label text-center leading-tight truncate"
            title={item.name}
          >
            {item.name}
          </span>
        </div>
      )}
    </div>
  );
}

export function EquipmentSection() {
  const { t, locale } = useI18n();
  const {
    data: equipment,
    loading,
    error,
    refetch,
  } = useAsync(() => getPublicEquipment(), []);

  const isMobile = useIsMobile();
  const isRTL = locale === "ar";

  const perRow = isMobile ? 4 : 8;
  const rows = equipment ? chunkArray(equipment, perRow) : [];

  return (
    <Section
      id="equipment"
      className="relative w-full overflow-hidden bg-surface py-20 md:py-28"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-headline-lg text-on-surface">
            {t.equipment.title}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-3">
            {t.equipment.subtitle}
          </p>
        </motion.div>

        {error && <ErrorState message={error} onRetry={refetch} />}

        {loading && !equipment && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/5 bg-surface-container/80 p-4">
                  <LoaderSkeleton width={90} height={90} borderRadius={18} className="mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {equipment && equipment.length > 0 && (
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <InfiniteRow
                key={rowIndex}
                items={row}
                speed={25 + rowIndex * 5}
                reverse={rowIndex % 2 !== 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fade edges */}
      <div
        className={`absolute inset-y-0 ${isRTL ? "right-0" : "left-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "l" : "r"} from-surface to-transparent z-20 pointer-events-none`}
      />
      <div
        className={`absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "r" : "l"} from-surface to-transparent z-20 pointer-events-none`}
      />
    </Section>
  );
}