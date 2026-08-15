import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  listPortfolio,
  deletePortfolioEvent,
  updatePortfolioEvent,
  reorderPortfolioEvents,
} from "../../services/endpoints/portfolio";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";
import { Badge, BehindTheScenesBadge } from "../../components/ui/Card";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { generateUniqueSlug } from "../../utils/slug";

export default function PortfolioAdminListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => listPortfolio(), []);

  // حالة النافذة المنبثقة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  // دالة توليد Slug عند كتابة العنوان
  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(generateUniqueSlug(val)); // توليد تلقائي
  }

  // الانتقال لصفحة التعديل دون إرسال API
  function handleConfirmCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsModalOpen(false);
    // التوجيه إلى صفحة 'new' مع تمرير البيانات المبدئية عبر state
    navigate("/admin/portfolio/new", {
      state: {
        initialTitle: { en: title, ar: "" },
        initialSlug: slug || `event-${Date.now()}`,
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">
          {t.admin.portfolioModule}
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>{t.common.create}</Button>
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
                {event.cover_image_url && (
                  <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">
                  {typeof event.title === "object" ? (event.title as any)?.ar || (event.title as any)?.en : event.title}
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge>{event.published ? t.common.published : t.common.draft}</Badge>
                  {event.behind_the_scenes && <BehindTheScenesBadge label={t.portfolio.bts} />}
                  <Badge>{event.sections?.length || 0} sections</Badge>
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

      {/* نافذة تحديد العنوان مبدئياً */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass rounded-xl p-6 md:p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6 text-on-surface">{t.common.create} Portfolio Event</h2>
            <form onSubmit={handleConfirmCreate} className="flex flex-col gap-5">
              <Field label="Title" htmlFor="modal-title">
                <Input
                  id="modal-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter event title"
                  required
                  autoFocus
                />
              </Field>

              <Field label="Slug" htmlFor="modal-slug">
                <Input
                  id="modal-slug"
                  value={slug}
                  readOnly
                  disabled
                  className="opacity-70 cursor-not-allowed"
                  required
                />
              </Field>

              <div className="flex items-center justify-end gap-3 mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit">{t.common.next || "Next"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}