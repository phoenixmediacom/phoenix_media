import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useTheme } from "../../contexts/ThemeContext";
import { useAsync } from "../../hooks/useAsync";
import { getHero } from "../../services/endpoints/hero";
import { getSubmissionsStatistics } from "../../services/endpoints/contact";
import { logout } from "../../services/endpoints/auth";

type MenuItem = {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
  showBadge?: boolean;
};

const items: MenuItem[] = [
  { to: "/admin", label: "overview", icon: "📊", end: true },
  { to: "/admin/hero", label: "heroModule", icon: "🎬" },
  { to: "/admin/about", label: "aboutModule", icon: "📖" },
  { to: "/admin/clients", label: "clientsModule", icon: "🤝" },
  { to: "/admin/equipment", label: "equipmentModule", icon: "🎥" },
  { to: "/admin/services", label: "servicesModule", icon: "🧩" },
  { to: "/admin/portfolio", label: "portfolioModule", icon: "🖼️" },
  { to: "/admin/contact", label: "contactModule", icon: "✉️" },
  { to: "/admin/messages", label: "messagesModule", icon: "💬", showBadge: true },
  { to: "/admin/social", label: "socialModule", icon: "🔗" },
  { to: "/admin/seo", label: "seoModule", icon: "🔍" },
  { to: "/admin/language", label: "languageModule", icon: "🌐" },
  { to: "/admin/settings", label: "settingsModule", icon: "⚙️" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { data: heroData, refetch } = useAsync(() => getHero(), []);

  const [newMessagesCount, setNewMessagesCount] = useState(0);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getSubmissionsStatistics();
        setNewMessagesCount(stats.new || 0);
      } catch (error) {
        console.error('Failed to fetch message stats:', error);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHeroUpdated = () => {
      refetch();
    };

    window.addEventListener("hero-settings-updated", handleHeroUpdated);
    return () => {
      window.removeEventListener("hero-settings-updated", handleHeroUpdated);
    };
  }, [refetch]);

  const logoSrc = heroData?.logoUrl || "/logo.png";

  return (
    <aside className="w-72 shrink-0 h-full bg-surface-container-lowest border-e border-glass-border flex flex-col">
      {/* ✅ Header Section - نفس ارتفاع Admin Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-glass-border">
        <img 
          src={logoSrc} 
          alt={heroData?.companyName || "Phoenix Media"} 
          className="h-8 w-8 object-contain" 
        />
        <span className="font-display font-bold text-on-surface truncate flex-1">
          {heroData?.companyName || "Phoenix Media"}
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {items.map((item) => {
          const labelText = t.admin[item.label as keyof typeof t.admin] as string || item.label;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end || false}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-primary-container/15 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="flex-1">{labelText}</span>
              
              {/* Badge */}
              {item.showBadge && newMessagesCount > 0 && (
                <span className="bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {newMessagesCount > 99 ? '99+' : newMessagesCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-glass-border">
        <button
          onClick={() => logout('/admin/auth/login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-error transition-colors"
        >
          <span aria-hidden="true">🚪</span>
          {t.common.logout}
        </button>
      </div>
    </aside>
  );
}