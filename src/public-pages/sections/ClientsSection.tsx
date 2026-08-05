import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listClients } from "../../services/endpoints/clients";
import { useEffect, useRef, useState, useCallback } from "react";

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
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const children = trackRef.current.children;
    const count = clients.length;
    if (count === 0) return;

    let totalWidth = 0;
    for (let i = 0; i < count; i++) {
      const child = children[i] as HTMLElement;
      if (child) {
        const style = window.getComputedStyle(child);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        totalWidth += child.offsetWidth + marginLeft + marginRight;
      }
    }

    // أضف الـ gap بين العناصر
    const gap = window.innerWidth < 768 ? 32 : 48;
    totalWidth += gap * (count - 1);

    // أضف gap واحد إضافي بين النسخة الأولى والثانية
    totalWidth += gap;

    setSingleSetWidth(totalWidth);
  }, [clients]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  if (clients.length === 0) return null;

  const duration = singleSetWidth > 0 ? singleSetWidth / speed : 20;

  return (
    <div className="relative w-full overflow-hidden py-3">
      <motion.div
        ref={trackRef}
        className="flex w-max items-center gap-8 md:gap-12"
        animate={{
          x: reverse ? [-singleSetWidth, 0] : [0, -singleSetWidth],
        }}
        transition={{
          x: {
            duration,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
        }}
        style={{ willChange: "transform" }}
      >
        {[...clients, ...clients, ...clients, ...clients].map(
          (client, i) => (
            <ClientLogo key={`${client.id}-${i}`} client={client} />
          )
        )}
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

  // عدد الصفوف حسب الجهاز
  const perRow = isMobile ? 4 : 8;
  const totalClients = clients?.length ?? 0;
  const rowCount = totalClients > 0 ? Math.ceil(totalClients / perRow) : 0;

  // تقسيم العملاء إلى صفوف
  const rows: Client[][] = [];
  if (clients) {
    for (let i = 0; i < rowCount; i++) {
      const start = i * perRow;
      const rowClients = clients.slice(start, start + perRow);

      // إذا الصف الأخير فيه عناصر أقل، نكمله بتكرار من البداية
      while (rowClients.length < perRow && clients.length > 0) {
        rowClients.push(clients[rowClients.length % clients.length]);
      }

      rows.push(rowClients);
    }
  }

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
          <div className="space-y-2">
            {rows.map((row, rowIndex) => (
              <InfiniteRow
                key={rowIndex}
                clients={row}
                speed={25 + rowIndex * 3}
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