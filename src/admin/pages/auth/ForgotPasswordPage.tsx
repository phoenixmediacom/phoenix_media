import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtp, verifyOtp } from '../../../services/endpoints/auth';
import { Field, Input } from '../../../components/ui/Form';
import { Button } from '../../../components/ui/Button';
import AuthLayout from './AuthLayout';

type Step = 'email' | 'otp';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState(10);

  // Step 1: Send OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await sendOtp(email);
      setExpiresIn(response.expires_in_minutes);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('يرجى إدخال الرمز المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtp(email, otpCode);
      // الانتقال لصفحة إدخال كلمة المرور الجديدة
      navigate('/admin/auth/reset-password', { 
        state: { email, otp: otpCode } 
      });
    } catch (err: any) {
      setError(err.message);
      // مسح الـ OTP عند الخطأ
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP input
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // أرقام فقط

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // الانتقال التلقائي للحقل التالي
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  // Handle paste
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      document.getElementById('otp-5')?.focus();
    }
  }

  // Handle backspace
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setLoading(true);

    try {
      const response = await sendOtp(email);
      setExpiresIn(response.expires_in_minutes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout 
      title={step === 'email' ? 'استعادة كلمة المرور' : 'أدخل رمز التحقق'}
      subtitle={
        step === 'email' 
          ? 'أدخل بريدك الإلكتروني لإرسال رمز التحقق'
          : `تم إرسال رمز مكون من 6 أرقام إلى ${email}`
      }
    >
      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.form
            key="email-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendOtp}
            className="flex flex-col gap-5"
          >
            <Field label="البريد الإلكتروني" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@phoenixmedia.com"
                autoComplete="email"
                disabled={loading}
                autoFocus
              />
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20"
              >
                <p className="text-error text-sm text-center">{error}</p>
              </motion.div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
            </Button>

            <Link to="/admin/auth/login" className="text-center">
              <button
                type="button"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </Link>
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.form
            key="otp-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerifyOtp}
            className="flex flex-col gap-5"
          >
            {/* OTP Input */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-on-surface">
                رمز التحقق
              </label>
              <div 
                className="flex gap-2 justify-center" 
                dir="ltr"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-glass-border bg-surface-variant/20 text-on-surface focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-on-surface-variant text-center">
                يمكنك لصق الرمز مباشرة من البريد الإلكتروني
              </p>
            </div>

            <p className="text-sm text-on-surface-variant text-center">
              الرمز صالح لمدة {expiresIn} دقائق
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20"
              >
                <p className="text-error text-sm text-center">{error}</p>
              </motion.div>
            )}

            <Button type="submit" disabled={loading || otp.join('').length !== 6}>
              {loading ? 'جارٍ التحقق...' : 'التحقق من الرمز'}
            </Button>

            {/* Resend OTP */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-primary hover:text-primary/80 transition-colors text-center disabled:opacity-50"
            >
              لم يصلك الرمز؟ إعادة الإرسال
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                setError(null);
              }}
              disabled={loading}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors text-center"
            >
              ← تغيير البريد الإلكتروني
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}