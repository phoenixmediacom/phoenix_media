import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Lightfall from '../../../components/backgrounds/Lightfall';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <Lightfall />
      </div>

      {/* Logo العائم في الخلفية */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img src="/phoenix-logo.svg" alt="" className="w-96 h-96" />
      </motion.div>

      {/* المحتوى */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* الهيدر */}
        <div className="flex items-center gap-3 mb-8">
          <motion.img
            src="/phoenix-logo.svg"
            alt="Phoenix Media"
            className="h-12 w-12"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-on-surface">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* المحتوى */}
        {children}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-glass-border">
          <p className="text-xs text-on-surface-variant/50 text-center">
            © 2024 Phoenix Media. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}