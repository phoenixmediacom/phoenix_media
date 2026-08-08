import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resetPassword } from '../../../services/endpoints/auth';
import { Field, Input } from '../../../components/ui/Form';
import { Button } from '../../../components/ui/Button';
import AuthLayout from './AuthLayout';

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

function validatePassword(password: string) {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUpperCase: PASSWORD_RULES.hasUpperCase.test(password),
    hasLowerCase: PASSWORD_RULES.hasLowerCase.test(password),
    hasNumber: PASSWORD_RULES.hasNumber.test(password),
    hasSpecialChar: PASSWORD_RULES.hasSpecialChar.test(password),
  };
}

function isPasswordValid(password: string): boolean {
  const checks = validatePassword(password);
  return Object.values(checks).every(Boolean);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // الحصول على email و otp من state (من صفحة ForgotPassword)
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // التحقق من وجود Email و OTP
  useEffect(() => {
    if (!email || !otp) {
      setError('رابط غير صالح. يرجى البدء من جديد.');
    }
  }, [email, otp]);

  const passwordChecks = validatePassword(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // التحقق من وجود البيانات المطلوبة
    if (!email || !otp) {
      setError('بيانات غير مكتملة. يرجى العودة وإعادة المحاولة.');
      return;
    }
    
    if (!isPasswordValid(password)) {
      setError('كلمة المرور لا تستوفي جميع الشروط');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      setSuccess(true);
      
      // إعادة التوجيه بعد 3 ثواني
      setTimeout(() => {
        navigate('/admin/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'فشل إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  }

  // إذا نجحت العملية
  if (success) {
    return (
      <AuthLayout title="تم بنجاح!" subtitle="تم إعادة تعيين كلمة المرور">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-on-surface mb-2">تم إعادة تعيين كلمة المرور بنجاح!</p>
          <p className="text-sm text-on-surface-variant mb-6">
            سيتم نقلك إلى صفحة تسجيل الدخول...
          </p>
          
          <Link to="/admin/auth/login">
            <Button>تسجيل الدخول الآن</Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="إعادة تعيين كلمة المرور" 
      subtitle="أدخل كلمة المرور الجديدة"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Email (readonly) */}
        <Field label="البريد الإلكتروني" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            disabled
            className="bg-surface-variant/20 cursor-not-allowed"
          />
        </Field>

        {/* Password */}
        <Field label="كلمة المرور الجديدة" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || !email || !otp}
              autoFocus
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

        {/* Password Strength Indicator */}
        {password && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-surface-variant/10 text-xs space-y-1"
          >
            <p className="font-semibold mb-2">متطلبات كلمة المرور:</p>
            <PasswordCheck checked={passwordChecks.minLength}>
              8 أحرف على الأقل
            </PasswordCheck>
            <PasswordCheck checked={passwordChecks.hasUpperCase}>
              حرف كبير واحد على الأقل (A-Z)
            </PasswordCheck>
            <PasswordCheck checked={passwordChecks.hasLowerCase}>
              حرف صغير واحد على الأقل (a-z)
            </PasswordCheck>
            <PasswordCheck checked={passwordChecks.hasNumber}>
              رقم واحد على الأقل (0-9)
            </PasswordCheck>
            <PasswordCheck checked={passwordChecks.hasSpecialChar}>
              رمز خاص واحد على الأقل (!@#$%...)
            </PasswordCheck>
          </motion.div>
        )}

        {/* Password Confirmation */}
        <Field label="تأكيد كلمة المرور" htmlFor="password_confirmation">
          <div className="relative">
            <Input
              id="password_confirmation"
              type={showPasswordConfirmation ? 'text' : 'password'}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              disabled={loading || !email || !otp}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showPasswordConfirmation ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </Field>

        {/* Password Match Indicator */}
        {password && passwordConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
              password === passwordConfirmation
                ? 'bg-primary/10 text-primary'
                : 'bg-error/10 text-error'
            }`}
          >
            {password === passwordConfirmation ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>كلمتا المرور متطابقتان</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>كلمتا المرور غير متطابقتين</span>
              </>
            )}
          </motion.div>
        )}

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
        <Button 
          type="submit" 
          disabled={
            loading || 
            !email || 
            !otp || 
            !isPasswordValid(password) || 
            password !== passwordConfirmation
          }
        >
          {loading ? 'جارٍ الحفظ...' : 'إعادة تعيين كلمة المرور'}
        </Button>

        <Link to="/admin/auth/login" className="text-center">
          <button
            type="button"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            ← العودة إلى تسجيل الدخول
          </button>
        </Link>
      </form>
    </AuthLayout>
  );
}

// Password Check Component
function PasswordCheck({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${checked ? 'text-primary' : 'text-on-surface-variant/50'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        checked ? 'bg-primary' : 'bg-surface-variant/30'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span>{children}</span>
    </div>
  );
}