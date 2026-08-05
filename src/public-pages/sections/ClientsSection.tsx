import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listClients } from "../../services/endpoints/clients";
import { useEffect, useRef, useState } from "react";

interface Client {
  id: string;
  name: string;
  logoUrl?: string;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);

    // نكمل الصف الناقص حتى لا ينقطع الدوران
    if (chunk.length > 0 && chunk.length < size) {
      let fillIndex = 0;
      while (chunk.length < size) {
        chunk.push(arr[fillIndex % arr.length]);
        fillIndex++;
      }
    }

    chunks.push(chunk);
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
  speed = 40,
  reverse = false,
}: {
  clients: Client[];
  speed?: number;
  reverse?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      setTrackWidth(el.scrollWidth / 2);
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [clients]);

  const duration = trackWidth > 0 ? trackWidth / speed : 20;

  return (
    <div className="relative w-full overflow-hidden py-3">
      <motion.div
        ref={trackRef}
        className="flex w-max gap-8 md:gap-12"
        animate={
          reverse
            ? { x: [-trackWidth, 0] }
            : { x: [0, -trackWidth] }
        }
        transition={{
          x: {
            duration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        style={{ willChange: "transform" }}
      >
        {[...clients, ...clients].map((client, i) => (
          <ClientLogo key={`${client.id}-${i}`} client={client} />
        ))}
      </motion.div>
    </div>
  );
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
  const rows = clients && clients.length > 0 ? chunkArray(clients, perRow) : [];

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
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <InfiniteRow
                key={rowIndex}
                clients={row}
                speed={30 + rowIndex * 5}
                reverse={isRTL ? rowIndex % 2 === 0 : rowIndex % 2 !== 0}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`absolute inset-y-0 ${isRTL ? "right-0" : "left-0"} w-16 md:w-24 z-20 pointer-events-none`}
        style={{
          background: isRTL
            ? "linear-gradient(to left, var(--color-surface-container-lowest), transparent)"
            : "linear-gradient(to right, var(--color-surface-container-lowest), transparent)",
        }}
      />
      <div
        className={`absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} w-16 md:w-24 z-20 pointer-events-none`}
        style={{
          background: isRTL
            ? "linear-gradient(to right, var(--color-surface-container-lowest), transparent)"
            : "linear-gradient(to left, var(--color-surface-container-lowest), transparent)",
        }}
      />
    </section>
  );
}