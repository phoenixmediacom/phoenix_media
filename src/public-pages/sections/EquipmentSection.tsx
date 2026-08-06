import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listEquipment } from "../../services/endpoints/equipment";
import { useEffect, useState } from "react";
import { Section } from "../../components/layout/Section";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

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

  // مضاعفة العناصر لضمان وجود عدد كافٍ يغطي الشاشة بدون أي فراغ
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
  const [imgError, setImgError] = useState(false);
  const hasImage = item.logoUrl && !imgError;

  return (
    <div className="flex-shrink-0 flex items-center justify-center w-[72px] h-[72px] md:w-[100px] md:h-[100px] rounded-xl bg-surface-container/50 border border-outline-variant/10 backdrop-blur-sm transition-transform duration-300 hover:scale-110">
      {hasImage ? (
        <img
          src={item.logoUrl}
          alt={item.name}
          title={item.name}
          onError={() => setImgError(true)}
          className="w-12 h-12 md:w-16 md:h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
          loading="lazy"
        />
      ) : (
        <span
          className="text-on-surface-variant text-xs md:text-sm font-mono-label text-center leading-tight px-2 truncate max-w-full"
          title={item.name}
        >
          {item.name}
        </span>
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
  } = useAsync(() => listEquipment(), []);

  const isMobile = useIsMobile();
  const isRTL = locale === "ar";

  // تحديد العدد لكل صف (4 للهاتف، 8 للشاشات الأكبر)
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

        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}

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

      {/* حواف التلاشي (Fade edges) */}
      <div
        className={`absolute inset-y-0 ${isRTL ? "right-0" : "left-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "l" : "r"} from-surface to-transparent z-20 pointer-events-none`}
      />
      <div
        className={`absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "r" : "l"} from-surface to-transparent z-20 pointer-events-none`}
      />
    </Section>
  );
}