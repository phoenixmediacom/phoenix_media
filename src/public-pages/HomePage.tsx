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
import { SimplePhoenixLoader } from "../components/SimplePhoenixLoader";
import { useAsync } from "../hooks/useAsync";
import { getHero } from "../services/endpoints/hero";
import { SeoHead } from "../components/layout/SeoHead";

export default function HomePage() {
  const { loading: heroLoading } = useAsync(() => getHero(), []);
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <SeoHead />

      {/* ✅ Loader الجديد البسيط */}
      {!showContent && (
        <SimplePhoenixLoader
          isLoading={heroLoading}
          onComplete={() => setShowContent(true)}
        />
      )}

      {/* المحتوى */}
      <div style={{ 
        opacity: showContent ? 1 : 0, 
        transition: "opacity 0.5s ease" 
      }}>
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