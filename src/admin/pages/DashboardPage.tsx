import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getDashboardStats } from "../../services/endpoints/dashboard";
import { getSubmissionsStatistics } from "../../services/endpoints/contact";
import { listPortfolio } from "../../services/endpoints/portfolio";
import { listEquipment } from "../../services/endpoints/equipment";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/AsyncStates";

// ✅ تعريف النوع بدون 'as const'
type QuickLink = {
  to: string;
  label: string;
  icon: string;
};

const quickLinks: QuickLink[] = [
  { to: "/admin/hero", label: "heroModule", icon: "🎬" },
  { to: "/admin/about", label: "aboutModule", icon: "📖" },
  { to: "/admin/portfolio", label: "portfolioModule", icon: "🖼️" },
  { to: "/admin/services", label: "servicesModule", icon: "🧩" },
  { to: "/admin/clients", label: "clientsModule", icon: "🤝" },
  { to: "/admin/equipment", label: "equipmentModule", icon: "🎥" },
  { to: "/admin/contact", label: "contactModule", icon: "✉️" },
  { to: "/admin/messages", label: "messagesModule", icon: "💬" },
  { to: "/admin/social", label: "socialModule", icon: "🔗" },
];

export default function DashboardPage() {
  const { t } = useI18n();

  const { data: dashboardStats, loading: l1 } = useAsync(() => getDashboardStats(), []);
  const { data: portfolioData, loading: l2 } = useAsync(() => listPortfolio(), []);
  const { data: equipmentData, loading: l3 } = useAsync(() => listEquipment(), []);
  const { data: messagesStats, loading: l4 } = useAsync(() => getSubmissionsStatistics(), []);

  const loading = l1 || l2 || l3 || l4;

  const portfolioList = Array.isArray(portfolioData)
    ? portfolioData
    : (portfolioData as any)?.data || [];

  const equipmentList = Array.isArray(equipmentData)
    ? equipmentData
    : (equipmentData as any)?.data || [];

  const publishedCount = dashboardStats?.published_events ?? 0;
  const totalEvents = dashboardStats?.portfolio_events ?? 0;
  const draftCount = totalEvents - publishedCount;
  const btsCount = portfolioList.filter((p: any) => p.behind_the_scenes).length;

  const stats = [
    { label: t.admin.clientsModule, value: dashboardStats?.clients ?? 0, icon: "🤝" },
    { label: t.admin.equipmentModule, value: equipmentList.length, icon: "🎥" },
    { label: t.admin.servicesModule, value: dashboardStats?.services ?? 0, icon: "🧩" },
    { label: t.admin.portfolioModule, value: totalEvents, icon: "🖼️" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-headline-md text-on-surface mb-8">{t.admin.overview}</h1>
        {loading && <LoadingState />}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label as string}>
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
          {/* Portfolio Stats */}
          <Card className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-on-surface mb-5">
              {t.admin.portfolioModule}
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-surface-container-high">
                <p className="font-display text-3xl font-bold text-on-surface">{totalEvents}</p>
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

          {/* ✅ Messages Stats */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-on-surface">
                {/* ✅ الحل */}
                {typeof t.admin.messagesModule === 'string' ? t.admin.messagesModule : 'Messages'}
              </h2>
              {messagesStats && messagesStats.new > 0 && (
                <span className="bg-error text-on-error text-xs font-bold px-2 py-1 rounded-full">
                  {messagesStats.new} New
                </span>
              )}
            </div>
            
            {messagesStats && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high">
                  <span className="text-sm text-on-surface-variant">Total</span>
                  <span className="font-display text-xl font-bold text-on-surface">
                    {messagesStats.total}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-error/10">
                  <span className="text-sm text-error">New</span>
                  <span className="font-display text-xl font-bold text-error">
                    {messagesStats.new}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high">
                  <span className="text-sm text-on-surface-variant">Read</span>
                  <span className="font-display text-xl font-bold text-on-surface">
                    {messagesStats.read}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                  <span className="text-sm text-primary">Replied</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {messagesStats.replied}
                  </span>
                </div>
              </div>
            )}
            
            <Link
              to="/admin/contact/messages"
              className="inline-block text-primary text-sm font-medium hover:underline mt-4"
            >
              View all messages →
            </Link>
          </Card>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-bold text-on-surface mb-5">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            // ✅ استخراج النص بشكل آمن
            const labelText = t.admin[link.label as keyof typeof t.admin];
            const displayLabel = typeof labelText === 'string' ? labelText : link.label;

            return (
              <Link key={link.to} to={link.to}>
                <Card className="flex items-center gap-3 p-4 hover:bg-surface-container-high transition-colors">
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-sm font-medium text-on-surface">
                    {displayLabel}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}