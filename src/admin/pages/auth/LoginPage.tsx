import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../../i18n';
import { login } from '../../../services/endpoints/auth';
import { Field, Input } from '../../../components/ui/Form';
import { Button } from '../../../components/ui/Button';
import AuthLayout from './AuthLayout';

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      
      // إعادة التوجيه
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t.admin.invalidCredentials);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t.admin.loginTitle} subtitle={t.admin.loginSubtitle}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Email Field */}
        <Field label={t.admin.email} htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@phoenixmedia.com"
            autoComplete="email"
            disabled={loading}
          />
        </Field>

        {/* Password Field */}
        <Field label={t.admin.password} htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </Field>

        {/* Forgot Password Link */}
        <div className="flex justify-end -mt-2">
          <Link
            to="/admin/auth/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-error/10 border border-error/20"
          >
            <p className="text-error text-sm text-center">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="relative">
          {loading ? (
            <>
              <span className="opacity-0">{t.admin.signIn}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            t.admin.signIn
          )}
        </Button>

        {/* Demo Info */}
        {import.meta.env.DEV && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-on-surface-variant text-center">
              <strong>Demo:</strong> admin@phoenixmedia.com / Phoenix@2024
            </p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}