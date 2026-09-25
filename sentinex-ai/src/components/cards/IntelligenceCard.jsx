import * as Icons from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

const SEVERITY_TONE = { critical: "critical", warning: "warning", info: "info" };

// "Latest Intelligence" cards on the Overview page.
export default function IntelligenceCard({ icon, title, description, time, severity, onViewAnalysis }) {
  const Icon = Icons[icon] || Icons.Info;
  const safeSeverity = SEVERITY_TONE[severity] ? severity : "info";

  return (
    <div className="panel panel-hover p-4 flex flex-col gap-3 animate-fadeIn">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-base-surface2 flex items-center justify-center">
            <Icon className="w-4 h-4 text-accent-cyan" />
          </div>
          <h4 className="text-sm font-semibold text-ink-primary">{title}</h4>
        </div>
        <Badge tone={SEVERITY_TONE[safeSeverity] || "default"}>{safeSeverity}</Badge>
      </div>
      <p className="text-sm text-ink-secondary leading-relaxed">{description || "No details available."}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-ink-muted font-mono">{time}</span>
        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={onViewAnalysis}>
          View Analysis →
        </Button>
      </div>
    </div>
  );
}
