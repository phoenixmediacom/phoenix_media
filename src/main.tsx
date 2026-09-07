// D:\Project\phoenix_media\src\main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async"; // ✅ إضافة Provider
import "./index.css";
import App from "./App";

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// إخفاء التحذيرات الثانوية
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.join(' ');
  if (
    msg.includes('[Intervention]') || 
    msg.includes('Slow network') ||
    msg.includes('fonts.gstatic.com')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider> {/* ✅ التغليف هنا */}
      <App />
    </HelmetProvider>
  </StrictMode>,
);