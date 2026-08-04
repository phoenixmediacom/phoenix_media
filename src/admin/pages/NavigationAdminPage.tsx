import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listNavItems, updateNavItem, reorderNavItems } from "../../services/endpoints/navigation";
import { ReorderList } from "../../components/ui/ReorderList";
import { Checkbox } from "../../components/ui/Form";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import type { Dictionary } from "../../i18n/en";

export default function NavigationAdminPage() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useAsync(() => listNavItems(), []);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.navigationModule}
      </h1>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorderNavItems(ids).then(() => refetch())}
          renderItem={(item) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <span className="flex-1 font-medium text-on-surface">
                {resolveLabel(t, item.labelKey)}
              </span>
              <Checkbox
                id={`visible-${item.id}`}
                label="Visible"
                checked={item.visible}
                onChange={(checked) =>
                  updateNavItem(item.id, { visible: checked }).then(() => refetch())
                }
              />
            </div>
          )}
        />
      )}
    </div>
  );
}

function resolveLabel(t: Dictionary, path: string): string {
  const parts = path.split(".");
  let cursor: unknown = t;
  for (const part of parts) cursor = (cursor as Record<string, unknown>)?.[part];
  return typeof cursor === "string" ? cursor : path;
}
