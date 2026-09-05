import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getPublicClients } from "../../services/endpoints/clients";
import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext"; // ✅ إضافة
import { LoaderSkeleton } from "../../components/ui/loaders-skeleton";

interface Client {
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
  clients,
  speed = 30,
  reverse = false,
}: {
  clients: Client[];
  speed?: number;
  reverse?: boolean;
}) {
  if (!clients || clients.length === 0) return null;

  let baseList = [...clients];
  while (baseList.length < 12) {
    baseList = [...baseList, ...clients];
  }
  const displayClients = [...baseList, ...baseList];

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
        {displayClients.map((client, i) => (
          <ClientLogo key={`${client.id}-${i}`} client={client} />
        ))}
      </motion.div>
    </div>
  );
}

function ClientLogo({ client }: { client: Client }) {
  const { theme } = useTheme(); // ✅ إضافة
  const [imgError, setImgError] = useState(false);
  const hasImage = client.logoUrl && !imgError;

  return (
    <div 
      className="flex-shrink-0 flex items-center justify-center w-[100px] h-[100px] md:w-[140px] md:h-[140px] transition-all duration-300 hover:scale-110 group"
      title={client.name}
    >
      {hasImage ? (
        <div className="relative w-full h-full flex items-center justify-center p-3 md:p-4">
          {/* ✅ الشعار */}
          <img
            src={client.logoUrl}
            alt={client.name}
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
            title={client.name}
          >
            {client.name}
          </span>
        </div>
      )}
    </div>
  );
}

export function ClientsSection() {
  const { t, locale } = useI18n();
  const {
    data: clients,
    loading,
    error,
    refetch,
  } = useAsync(() => getPublicClients(), []);

  const isMobile = useIsMobile();
  const isRTL = locale === "ar";

  const perRow = isMobile ? 4 : 8;
  const rows = clients ? chunkArray(clients, perRow) : [];

  return (
    <section
      id="clients"
      className="relative w-full overflow-hidden bg-surface-container-lowest py-20 md:py-28"
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
            {t.clients.title}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-3">
            {t.clients.subtitle}
          </p>
        </motion.div>

        {loading && (
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoaderSkeleton key={index} width={110} height={56} borderRadius={12} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-on-surface-variant mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {clients && clients.length > 0 && (
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <InfiniteRow
                key={rowIndex}
                clients={row}
                speed={25 + rowIndex * 5}
                reverse={rowIndex % 2 !== 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fade edges */}
      <div
        className={`absolute inset-y-0 ${isRTL ? "right-0" : "left-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "l" : "r"} from-surface-container-lowest to-transparent z-20 pointer-events-none`}
      />
      <div
        className={`absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} w-16 md:w-24 bg-gradient-to-${isRTL ? "r" : "l"} from-surface-container-lowest to-transparent z-20 pointer-events-none`}
      />
    </section>
  );
}