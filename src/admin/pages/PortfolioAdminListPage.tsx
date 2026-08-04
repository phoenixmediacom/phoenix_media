import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  listPortfolio,
  createPortfolioEvent,
  deletePortfolioEvent,
  updatePortfolioEvent,
  reorderPortfolioEvents,
} from "../../services/endpoints/portfolio";
import { Button } from "../../components/ui/Button";
import { Badge, BehindTheScenesBadge } from "../../components/ui/Card";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

export default function PortfolioAdminListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => listPortfolio(), []);

  async function onCreate() {
    const event = await createPortfolioEvent({
      title: "Untitled Event",
      slug: `untitled-${Date.now()}`,
      coverImageUrl: "",
      behindTheScenes: false,
      published: false,
      sections: [],
    });
    navigate(`/admin/portfolio/${event.id}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">
          {t.admin.portfolioModule}
        </h1>
        <Button onClick={onCreate}>{t.common.create}</Button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorderPortfolioEvents(ids).then(() => refetch())}
          renderItem={(event) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <div className="h-14 w-20 rounded-md overflow-hidden bg-surface-container-high shrink-0">
                {event.coverImageUrl && (
                  <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">{event.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge>{event.published ? t.common.published : t.common.draft}</Badge>
                  {event.behindTheScenes && <BehindTheScenesBadge label={t.portfolio.bts} />}
                  <Badge>{event.sections.length} sections</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updatePortfolioEvent(event.id, { published: !event.published }).then(refetch)
                }
              >
                {event.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/portfolio/${event.id}`)}>
                {t.common.edit}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deletePortfolioEvent(event.id).then(() => refetch())}
              >
                {t.common.delete}
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}
