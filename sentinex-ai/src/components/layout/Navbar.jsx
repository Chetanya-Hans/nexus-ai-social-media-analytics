import { Bell, ChevronDown, Menu, Radio } from "lucide-react";
import { useState } from "react";
import { useFilters } from "../../context/FiltersContext";
import { platformOptions, dateRangeOptions } from "../../data/mockData";

// Dropdown used for platform + date range selectors.
function Dropdown({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-surface2 border border-base-border text-xs sm:text-sm text-ink-secondary hover:text-ink-primary hover:border-accent-cyan/40 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <ul
            role="listbox"
            className="absolute right-0 mt-2 w-48 panel z-20 py-1 max-h-64 overflow-y-auto animate-fadeIn"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-base-surface2 ${
                    opt === value
                      ? "text-accent-cyan"
                      : "text-ink-secondary"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Navbar({ onOpenMobileSidebar }) {
  const {
    platform,
    setPlatform,
    dateRange,
    setDateRange,
    project,
  } = useFilters();

  return (
    <header className="sticky top-0 z-20 h-16 bg-base-panel/90 backdrop-blur border-b border-base-border flex items-center justify-between px-4 sm:px-6 gap-3">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Mobile menu */}
        <button
          className="lg:hidden text-ink-muted hover:text-ink-primary"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* NEXUS BRAND */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Brand mark */}
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue items-center justify-center shadow-glow">
            <Radio className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-display font-bold tracking-tight text-ink-primary">
                NEXUS
              </span>

              <span className="hidden sm:inline text-lg font-display font-semibold tracking-tight text-accent-cyan">
  AI
</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">
                Social Intelligence
              </span>

              <span className="text-ink-muted">•</span>

              <span className="text-[10px] text-ink-muted truncate max-w-[180px]">
                {project}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* Platform */}
        <div className="hidden sm:block">
          <Dropdown
            value={platform}
            options={platformOptions}
            onChange={setPlatform}
            label="Platform filter"
          />
        </div>

        {/* Date range */}
        <div className="hidden md:block">
          <Dropdown
            value={dateRange}
            options={dateRangeOptions}
            onChange={setDateRange}
            label="Date range filter"
          />
        </div>

        {/* LIVE STATUS */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sentiment-positive/10 border border-sentiment-positive/30">
          <Radio className="w-3.5 h-3.5 text-sentiment-positive animate-pulseSoft" />

          <span className="text-xs font-mono font-medium text-sentiment-positive hidden sm:inline">
            LIVE
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-base-surface2 text-ink-secondary hover:text-ink-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />

          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan" />
        </button>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-semibold cursor-pointer">
          SA
        </div>

      </div>
    </header>
  );
}