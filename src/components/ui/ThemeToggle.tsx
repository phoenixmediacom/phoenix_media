import { useTheme } from "../../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-full glass hover:border-primary transition-all group ${className}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Container for icons */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon (Light Mode) */}
        <motion.svg
          initial={false}
          animate={{
            scale: theme === "light" ? 1 : 0,
            rotate: theme === "light" ? 0 : 180,
            opacity: theme === "light" ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute w-6 h-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </motion.svg>

        {/* Moon Icon (Dark Mode) */}
        <motion.svg
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : -180,
            opacity: theme === "dark" ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute w-6 h-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>
      </div>

      {/* Optional Label */}
      {showLabel && (
        <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      )}

      {/* Glow effect on hover */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 -z-10" />
    </button>
  );
}

/**
 * ✅ Alternative: Toggle Switch Style
 */
export function ThemeToggleSwitch({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full glass transition-colors ${className}`}
      role="switch"
      aria-checked={theme === "light"}
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-6 w-6 transform rounded-full transition ${
          theme === "light"
            ? "translate-x-7 bg-gradient-to-br from-primary to-secondary-container"
            : "translate-x-1 bg-surface-container-highest"
        }`}
      >
        {theme === "dark" ? (
          <svg
            className="h-6 w-6 text-primary p-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-white p-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </motion.span>
    </button>
  );
}

/**
 * ✅ Alternative: Floating Button Style
 */
export function ThemeToggleFloating() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-8 end-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary-container text-white shadow-bloom flex items-center justify-center bloom-on-hover"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        animate={{ rotate: theme === "light" ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}