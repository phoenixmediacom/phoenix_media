import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

//   Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// ✅ إخفاء تحذيرات Cloudinary والـ Intervention
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.join(' ');
  // تجاهل تحذيرات محددة
  if (
    msg.includes('[Intervention]') || 
    msg.includes('Slow network') ||
    msg.includes('fonts.gstatic.com')
  ) {
    return; // لا تطبع التحذير
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);