import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { login } from "../../services/endpoints/auth";
import { Field, Input } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname ?? "/admin", { replace: true });
    } catch {
      setError(t.admin.invalidCredentials);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <img src="/phoenix-logo.svg" alt="" className="h-10 w-10" />
          <div>
            <h1 className="font-display text-xl font-bold text-on-surface">
              {t.admin.loginTitle}
            </h1>
            <p className="text-sm text-on-surface-variant">{t.admin.loginSubtitle}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Field label={t.admin.email} htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@phoenixmedia.com"
            />
          </Field>
          <Field label={t.admin.password} htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {t.admin.signIn}
          </Button>
          <p className="text-xs text-on-surface-variant/70 text-center">
            Demo credentials: admin@phoenixmedia.com / phoenix2026
          </p>
        </form>
      </motion.div>
    </div>
  );
}
