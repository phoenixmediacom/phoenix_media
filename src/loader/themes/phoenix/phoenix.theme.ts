import type { CinematicTheme } from "../../engine/sequence.types";
import type { PhoenixControls } from "./phoenix.types";
import { usePhoenixSequence } from "./usePhoenixSequence";
import { PhoenixGlow } from "./components/PhoenixGlow";
import { PhoenixIgnition } from "./components/PhoenixIgnition";
import { PhoenixBody } from "./components/PhoenixBody";
import { PhoenixTrail } from "./components/PhoenixTrail";

/**
 * phoenix.theme.ts
 *
 * The single point where the phoenix's pieces are wired into the engine's
 * CinematicTheme contract. This is the only file a future Dragon/Falcon/
 * Company Logo/Seasonal theme needs an equivalent of — nothing in
 * `engine/` ever imports from here.
 */
export const phoenixTheme: CinematicTheme<PhoenixControls> = {
  id: "phoenix",
  label: "Phoenix Media",
  useSequence: usePhoenixSequence,
  Glow: PhoenixGlow,
  Ignition: PhoenixIgnition,
  Body: PhoenixBody,
  Trail: PhoenixTrail,
};
