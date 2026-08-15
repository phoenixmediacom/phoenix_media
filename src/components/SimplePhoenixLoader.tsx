import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import phoenixSvgUrl from "/phoenix-logo.svg";

interface SimplePhoenixLoaderProps {
  isLoading: boolean;
  onComplete: () => void;
}

export function SimplePhoenixLoader({ isLoading, onComplete }: SimplePhoenixLoaderProps) {
  const [phase, setPhase] = useState<"intro" | "idle" | "exit" | "done">("intro");
  const glowControls = useAnimationControls();
  const birdControls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;

    async function runAnimation() {
      // 1️⃣ مرحلة الظهور (Intro)
      setPhase("intro");
      
      // الوميض يظهر أولاً
      await glowControls.start({
        opacity: 0.7,
        scale: 1.2,
        transition: { duration: 1, ease: "easeOut" },
      });

      if (cancelled) return;

      // الطائر يظهر
      await birdControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      if (cancelled) return;

      // 2️⃣ مرحلة الانتظار (Idle)
      setPhase("idle");
      
      // حركة تنفس بسيطة للوميض
      glowControls.start({
        scale: [1.2, 1.35, 1.2],
        opacity: [0.7, 0.85, 0.7],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });

      // حركة طفو بسيطة للطائر
      birdControls.start({
        y: [0, -8, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });

      // انتظار حتى ينتهي التحميل
      while (!cancelled && isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (cancelled) return;

      // 3️⃣ مرحلة الإقلاع (Exit)
      setPhase("exit");

      // إيقاف الحركات اللانهائية
      glowControls.stop();
      birdControls.stop();
      
      // ✅ نفس الحركة بالضبط - نفس المدة والـ easing
      const exitDuration = 1.2;
      const exitEasing = [0.55, 0, 0.9, 0.4]; // تسارع سلس
      
      await Promise.all([
        birdControls.start({
          y: -800,
          opacity: 0, // ✅ أضف اختفاء
          scale: 0.9,
          transition: { 
            duration: exitDuration, 
            ease: exitEasing,
          },
        }),
        glowControls.start({
          y: -800,
          opacity: 0,
          scale: 1.5,
          transition: { 
            duration: exitDuration, 
            ease: exitEasing, // ✅ نفس الـ easing
          },
        }),
      ]);

      if (cancelled) return;

      // 4️⃣ انتهى
      setPhase("done");
      onComplete();
    }

    runAnimation();

    return () => {
      cancelled = true;
      glowControls.stop();
      birdControls.stop();
    };
  }, [isLoading, glowControls, birdControls, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* الوميض (الدائرة المضيئة) */}
      <motion.div
        animate={glowControls}
        initial={{ opacity: 0, scale: 0.8 }}
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,138,46,0.8) 0%, rgba(255,138,46,0.4) 40%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* الطائر */}
      <motion.img
        src={phoenixSvgUrl}
        alt="Loading..."
        animate={birdControls}
        initial={{ opacity: 0, scale: 0.85, y: 0 }}
        style={{
          position: "absolute",
          width: "240px",
          height: "240px",
          objectFit: "contain",
          filter: "drop-shadow(0 0 30px rgba(255,138,46,0.6))",
        }}
      />

      {/* نص التحميل (اختياري) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "idle" ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          bottom: "80px",
          color: "#FF8A2E",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "2px",
        }}
      >
        LOADING...
      </motion.div>
    </div>
  );
}