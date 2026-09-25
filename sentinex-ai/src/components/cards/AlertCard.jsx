import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

const SEVERITY_CONFIG = {
  critical: { icon: AlertOctagon, tone: "critical", label: "Critical" },
  warning: { icon: AlertTriangle, tone: "warning", label: "Warning" },
  info: { icon: Info, tone: "info", label: "Info" },
};

export default function AlertCard({ severity, time, description, topic, resolved, onView }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className="panel p-4 flex items-start gap-3 animate-fadeIn">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          severity === "critical"
            ? "bg-sentiment-negative/10"
            : severity === "warning"
            ? "bg-sentiment-warning/10"
            : "bg-accent-cyan/10"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${
            severity === "critical"
              ? "text-sentiment-negative"
              : severity === "warning"
              ? "text-sentiment-warning"
              : "text-accent-cyan"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge tone={config.tone}>{config.label}</Badge>
          {resolved && (
            <Badge tone="positive">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </Badge>
          )}
          <span className="text-xs text-ink-muted font-mono">{time}</span>
        </div>
        <p className="text-sm text-ink-primary">{description}</p>
        <p className="text-xs text-ink-muted mt-1">Affected topic: {topic}</p>
      </div>

      <Button variant="secondary" className="shrink-0 !px-3 !py-1.5 text-xs" onClick={onView}>
        View
      </Button>
    </div>
  );
}
