import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listClients } from "../../services/endpoints/clients";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  logoUrl?: string;
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

function ClientLogo({ client }: { client: Client }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = client.logoUrl && !imgError;

  return (
    <div className="flex-shrink-0 flex items-center justify-center w-[72px] h-[72px] md:w-[100px] md:h-[100px] rounded-xl bg-surface-container/50 border border-outline-variant/10 backdrop-blur-sm transition-transform duration-300 hover:scale-110">
      {hasImage ? (
        <img
          src={client.logoUrl}
          alt={client.name}
          title={client.name}
          onError={() => setImgError(true)}
          className="w-12 h-12 md:w-16 md:h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
          loading="lazy"
        />
      ) : (
        <span
          className="text-on-surface-variant text-xs md:text-sm font-mono-label text-center leading-tight px-2 truncate max-w-full"
          title={client.name}
        >
          {client.name}
        </span>
      )}
    </div>
  );
}

function InfiniteRow({
  clients,
  duration = 30,
  reverse = false,
}: {
  clients: Client[];
  duration?: number;
  reverse?: boolean;
}) {
  if (clients.length === 0) return null;

  const direction = reverse ? "scroll-right" : "scroll-left";

  return (
    <div className="relative w-full overflow-hidden py-3">
      <div
        className={`flex w-max items-center gap-8 md:gap-12 ${direction}`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {/* نكرر 4 مرات لضمان عدم الانقطاع */}
        {Array.from({ length: 4 }).map((_, setIndex) =>
          clients.map((client, i) => (
            <ClientLogo
              key={`${setIndex}-${client.id}-${i}`}
              client={client}
            />
          ))
        )}
      </div>
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
  } = useAsync(() => listClients(), []);

  const isMobile = useIsMobile();
  const isRTL = locale === "ar";

  const perRow = isMobile ? 4 : 8;

  // تقسيم العملاء إلى صفوف
  const rows: Client[][] = [];
  if (clients && clients.length > 0) {
    for (let i = 0; i < clients.length; i += perRow) {
      const rowClients = clients.slice(i, i + perRow);

      // إذا الصف الأخير ناقص، نكمله من البداية
      while (rowClients.length < perRow) {
        rowClients.push(
          clients[rowClients.length % clients.length]
        );
      }

      rows.push(rowClients);
    }
  }

  return (
    <section
      id="clients"
      className="relative w-full overflow-hidden bg-surface-container-lowest py-20 md:py-28"
    >
      {/* CSS للدوران المستمر */}
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .scroll-left {
          animation: scrollLeft linear infinite;
        }
        .scroll-right {
          animation: scrollRight linear infinite;
        }
        .scroll-left:hover,
        .scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>

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
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          <div className="space-y-2">
            {rows.map((row, rowIndex) => (
              <InfiniteRow
                key={rowIndex}
                clients={row}
                duration={35 + rowIndex * 5}
                reverse={isRTL ? rowIndex % 2 === 0 : rowIndex % 2 !== 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-surface-container-lowest to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-surface-container-lowest to-transparent z-20 pointer-events-none" />
    </section>
  );
}