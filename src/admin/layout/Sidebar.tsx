import { NavLink } from "react-router-dom";
import { useI18n } from "../../i18n";
import { logout } from "../../services/endpoints/auth";
import { useNavigate } from "react-router-dom";

const items = [
  { to: "/admin", label: "overview", icon: "📊", end: true },
  { to: "/admin/hero", label: "heroModule", icon: "🎬" },
  { to: "/admin/about", label: "aboutModule", icon: "📖" },
  { to: "/admin/clients", label: "clientsModule", icon: "🤝" },
  { to: "/admin/equipment", label: "equipmentModule", icon: "🎥" },
  { to: "/admin/services", label: "servicesModule", icon: "🧩" },
  { to: "/admin/portfolio", label: "portfolioModule", icon: "🖼️" },
  { to: "/admin/contact", label: "contactModule", icon: "✉️" },
  { to: "/admin/social", label: "socialModule", icon: "🔗" },
  { to: "/admin/navigation", label: "navigationModule", icon: "🧭" },
  { to: "/admin/seo", label: "seoModule", icon: "🔍" },
  { to: "/admin/language", label: "languageModule", icon: "🌐" },
  { to: "/admin/settings", label: "settingsModule", icon: "⚙️" },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <aside className="w-72 shrink-0 h-full bg-surface-container-lowest border-e border-glass-border flex flex-col">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-glass-border">
        <img src="/logo.png" alt="" className="h-8 w-8" />
        <span className="font-display font-bold text-on-surface">Phoenix Media</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : false}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-container/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {t.admin[item.label as keyof typeof t.admin]}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-glass-border">
        <button
          onClick={() => {
            logout();
            navigate("/admin/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-error transition-colors"
        >
          <span aria-hidden="true">🚪</span>
          {t.common.logout}
        </button>
      </div>
    </aside>
  );
}
