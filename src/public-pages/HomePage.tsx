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
      <SeoHead />
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