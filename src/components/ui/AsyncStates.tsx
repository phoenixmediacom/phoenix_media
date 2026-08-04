import { useI18n } from "../../i18n";
import { Button } from "./Button";

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-on-surface-variant">
      <span
        className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm">{label ?? t.common.loading}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="text-error text-body-lg">{message ?? t.common.error}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}
