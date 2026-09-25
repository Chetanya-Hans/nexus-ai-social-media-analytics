import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Smile,
  Users,
  TrendingUp,
  Share2,
  Clock,
  Bot,
  Database,
  Bell,
  Settings,
  Radio,
  Menu,
  X,
} from "lucide-react";

// Every nav item: path, label, icon.
const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/sentiment", label: "Sentiment", icon: Smile },
  { to: "/audience", label: "Audience", icon: Users },
  { to: "/trends", label: "Trends", icon: TrendingUp },
  { to: "/network", label: "Network", icon: Share2 },
  { to: "/timeline", label: "Timeline", icon: Clock },
  { to: "/ai-analyst", label: "AI Analyst", icon: Bot },
  { to: "/data-sources", label: "Data Sources", icon: Database },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full bg-base-panel border-r border-base-border flex flex-col transition-all duration-300
        ${collapsed ? "lg:w-[76px]" : "lg:w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        w-64`}
        aria-label="Main navigation"
      >
        {/* Logo row */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-border shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center shrink-0 shadow-glow">
              <Radio className="w-4 h-4 text-base-bg" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-display font-semibold text-ink-primary tracking-tight whitespace-nowrap block">
                  NEXUS <span className="text-accent-cyan">AI</span>
                </span>
                <span className="text-[10px] text-ink-muted font-mono whitespace-nowrap">NTRO · PS #26152</span>
              </div>
            )}
          </div>
          <button
            className="lg:hidden text-ink-muted hover:text-ink-primary"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            className="hidden lg:block text-ink-muted hover:text-ink-primary"
            onClick={onToggle}
            aria-label="Toggle sidebar width"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative
                ${isActive
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-base-surface2"}`
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent-cyan rounded-full" />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System status + profile */}
        <div className="border-t border-base-border p-3 space-y-3 shrink-0">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2 h-2 rounded-full bg-sentiment-positive animate-pulseSoft shrink-0" />
            {!collapsed && (
              <span className="text-xs text-ink-secondary">All systems operational</span>
            )}
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-surface2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-semibold shrink-0">
              SA
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm text-ink-primary truncate">SIH Analyst</p>
                <p className="text-xs text-ink-muted truncate">analyst@sentinex.ai</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
