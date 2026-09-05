import { useEffect, useState } from "react";

export function MaintenancePage() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      setPointer({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("pointermove", updatePointer);
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  return (
    <main
      lang="ar"
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        padding: "32px",
        background: "radial-gradient(circle at center, #111111 0%, #050505 45%, #000000 100%)",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${50 + pointer.x * 20}% ${50 + pointer.y * 20}%, rgba(255,255,255,0.16), transparent 32%)`,
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "620px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <img
          src="/logo.png"
          alt="Phoenix Media"
          style={{
            width: "min(260px, 70vw)",
            height: "auto",
            filter: "drop-shadow(0 20px 30px rgba(255,255,255,0.16))",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.15 }}>
            الموقع تحت الصيانة
          </h1>
          <h2 style={{ margin: 0, fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 500, color: "#d7d7d7" }}>
            Site under maintenance
          </h2>
        </div>

        <p style={{ margin: 0, color: "#cfcfcf", fontSize: "18px", lineHeight: 1.8, maxWidth: "520px" }}>
          نأسف للإزعاج. نحن نعمل على تحسين الموقع وأداءه. يرجى العودة قريبًا.
          <br />
          We apologize for the inconvenience. We are improving the site and its performance. Please check back soon.
        </p>
      </section>
    </main>
  );
}