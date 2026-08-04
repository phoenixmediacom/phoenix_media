import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listClients } from "../../services/endpoints/clients";
import { listEquipment } from "../../services/endpoints/equipment";
import { listServices } from "../../services/endpoints/services";
import { listPortfolio } from "../../services/endpoints/portfolio";
import { listContactSubmissions } from "../../services/endpoints/contact";
import { listSocialLinks } from "../../services/endpoints/social";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/AsyncStates";

const quickLinks = [
  { to: "/admin/hero", label: "heroModule", icon: "🎬" },
  { to: "/admin/about", label: "aboutModule", icon: "📖" },
  { to: "/admin/portfolio", label: "portfolioModule", icon: "🖼️" },
  { to: "/admin/services", label: "servicesModule", icon: "🧩" },
  { to: "/admin/clients", label: "clientsModule", icon: "🤝" },
  { to: "/admin/equipment", label: "equipmentModule", icon: "🎥" },
  { to: "/admin/contact", label: "contactModule", icon: "✉️" },
  { to: "/admin/social", label: "socialModule", icon: "🔗" },
] as const;

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: clients, loading: l1 } = useAsync(() => listClients(), []);
  const { data: equipment, loading: l2 } = useAsync(() => listEquipment(), []);
  const { data: services, loading: l3 } = useAsync(() => listServices(), []);
  const { data: portfolio, loading: l4 } = useAsync(() => listPortfolio(), []);
  const { data: submissions, loading: l5 } = useAsync(() => listContactSubmissions(), []);
  const { data: social, loading: l6 } = useAsync(() => listSocialLinks(), []);

  const loading = l1 || l2 || l3 || l4 || l5 || l6;
  const publishedCount = portfolio?.filter((p) => p.published).length ?? 0;
  const draftCount = (portfolio?.length ?? 0) - publishedCount;
  const btsCount = portfolio?.filter((p) => p.behindTheScenes).length ?? 0;

  const stats = [
    { label: t.admin.clientsModule, value: clients?.length ?? 0, icon: "🤝" },
    { label: t.admin.equipmentModule, value: equipment?.length ?? 0, icon: "🎥" },
    { label: t.admin.servicesModule, value: services?.length ?? 0, icon: "🧩" },
    { label: t.admin.socialModule, value: social?.length ?? 0, icon: "🔗" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-headline-md text-on-surface mb-8">{t.admin.overview}</h1>
        {loading && <LoadingState />}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <span className="text-3xl" aria-hidden="true">
                  {stat.icon}
                </span>
                <p className="font-display text-4xl font-bold text-on-surface mt-4">{stat.value}</p>
                <p className="text-sm text-on-surface-variant mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-on-surface mb-5">
              {t.admin.portfolioModule}
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-surface-container-high">
                <p className="font-display text-3xl font-bold text-on-surface">
                  {portfolio?.length ?? 0}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Total events</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-container-high">
                <p className="font-display text-3xl font-bold text-primary">{publishedCount}</p>
                <p className="text-xs text-on-surface-variant mt-1">{t.common.published}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-container-high">
                <p className="font-display text-3xl font-bold text-on-surface-variant">
                  {draftCount}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">{t.common.draft}</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              {btsCount} event{btsCount === 1 ? "" : "s"} marked Behind The Scenes.
            </p>
            <Link
              to="/admin/portfolio"
              className="inline-block text-primary text-sm font-medium hover:underline"
            >
              Manage portfolio →
            </Link>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold text-on-surface mb-5">
              Recent messages
            </h2>
            {submissions && submissions.length === 0 && (
              <p className="text-sm text-on-surface-variant">No messages yet.</p>
            )}
            <div className="flex flex-col gap-4">
              {submissions?.slice(0, 4).map((s) => (
                <div key={s.id} className="border-b border-glass-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-on-surface">{s.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{s.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-bold text-on-surface mb-5">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="flex items-center gap-3 p-4">
                <span className="text-2xl">{link.icon}</span>
                <span className="text-sm font-medium text-on-surface">
                  {t.admin[link.label as keyof typeof t.admin]}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
