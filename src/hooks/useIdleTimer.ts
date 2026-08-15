import { useEffect, useRef } from 'react';

interface UseIdleTimerProps {
  onIdle: () => void;
  timeoutInMinutes?: number;
}

export function useIdleTimer({ onIdle, timeoutInMinutes = 30 }: UseIdleTimerProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // تحويل الدقائق إلى مللي ثانية (30 دقيقة = 30 * 60 * 1000)
    timerRef.current = setTimeout(onIdle, timeoutInMinutes * 60 * 1000);
  };

  useEffect(() => {
    // الأحداث التي تعبر عن نشاط المستخدم
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      resetTimer();
    };

    // إضافة المستمعين للأحداث
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // تشغيل التايمر لأول مرة
    resetTimer();

    // تنظيف الأحداث عند الخروج من الصفحة
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);
}