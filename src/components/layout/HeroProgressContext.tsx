import { createContext, useContext, type PropsWithChildren } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";

const HeroProgressContext = createContext(0);

export function HeroProgressProvider({ children }: PropsWithChildren) {
  const progress = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight * 0.9 : 800,
  );
  return (
    <HeroProgressContext.Provider value={progress}>{children}</HeroProgressContext.Provider>
  );
}

export function useHeroProgress(): number {
  return useContext(HeroProgressContext);
}
