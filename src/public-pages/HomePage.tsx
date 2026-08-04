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
import { CinematicLoadingEngine } from "../loader/engine/CinematicLoadingEngine";
import { EngineErrorBoundary } from "../loader/engine/EngineErrorBoundary";
import { phoenixTheme } from "../loader/themes/phoenix/phoenix.theme";
import { useAsync } from "../hooks/useAsync";
import { getHero } from "../services/endpoints/hero";

export default function HomePage() {
  const { loading: heroLoading } = useAsync(() => getHero(), []);
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      {!showContent && (
        <EngineErrorBoundary onError={() => setShowContent(true)}>
          <CinematicLoadingEngine
            theme={phoenixTheme}
            isLoading={heroLoading}
            onExitComplete={() => setShowContent(true)}
          />
        </EngineErrorBoundary>
      )}

      <div style={{ opacity: showContent ? 1 : 0, transition: "opacity 0.4s ease" }}>
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
    </>
  );
}
