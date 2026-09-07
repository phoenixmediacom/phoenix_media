import { useState } from "react";
import { Nav } from "../components/layout/Nav";
import { HeroProgressProvider } from "../components/layout/HeroProgressContext";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ClientsSection } from "./sections/ClientsSection";
import { EquipmentSection } from "./sections/EquipmentSection";
import { ServicesSection } from "./sections/ServicesSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { ContactSection } from "./sections/ContactSection";
import { BrandCorner } from "./sections/BrandCorner";
import { PublicPageGate } from "../components/PublicPageGate";
import { useAsync } from "../hooks/useAsync";
import { getPublicSettings } from "../services/endpoints/settings";
import { SeoHead } from "../components/layout/SeoHead";
import { hasIntroPlayed, markIntroPlayed } from "../utils/introSession";

export default function HomePage() {
  const {
    data: settings,
    loading,
    error,
    errorStatus,
    serverUnavailable,
    refetch,
  } = useAsync(() => getPublicSettings(), []);
  const [introComplete, setIntroComplete] = useState(() => hasIntroPlayed());

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Phoenix Media",
    "alternateName": "فينكس ميديا",
    "url": "https://www.phoenixmediacom.com",
    "logo": "https://www.phoenixmediacom.com/og-image.jpg",
    "description": "شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي بأعلى معايير الجودة.",
    "sameAs": [
      "https://www.facebook.com/phoenixmediacom",
      "https://www.instagram.com/phoenixmediacom",
      "https://www.linkedin.com/company/phoenixmediacom"
    ]
  };

  return (
    <PublicPageGate
      introComplete={introComplete}
      loading={loading}
      maintenanceMode={settings?.maintenanceMode === true}
      serverUnavailable={serverUnavailable}
      error={error}
      errorStatus={errorStatus}
      onIntroComplete={() => {
        markIntroPlayed();
        setIntroComplete(true);
      }}
      onRetry={refetch}
    >
      {/* ✅ إرسال البيانات إلى SeoHead */}
      <SeoHead 
        title="Phoenix Media | بيت إنتاج سينمائي وإعلامي"
        description="شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي والتغطيات الميدانية."
        jsonLd={organizationSchema}
      />
      <div>
        <HeroProgressProvider>
          <Nav />
          <BrandCorner />
          <main>
            <HeroSection />
            <AboutSection />
            <ClientsSection />
            <EquipmentSection />
            <ServicesSection />
            <PortfolioSection />
            <ContactSection />
          </main>
        </HeroProgressProvider>
      </div>
    </PublicPageGate>
  );
}