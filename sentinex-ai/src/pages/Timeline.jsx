import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { getTimelineData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import Modal from "../components/common/Modal";
import { MessageCircle, TrendingUp, Star, Smile, Globe2, AlertTriangle, Zap } from "lucide-react";

// Icon + color per event type, as requested in the brief.
const EVENT_CONFIG = {
  post: { icon: MessageCircle, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
  spike: { icon: Zap, color: "text-accent-purple", bg: "bg-accent-purple/10" },
  influencer: { icon: Star, color: "text-sentiment-warning", bg: "bg-sentiment-warning/10" },
  sentiment: { icon: Smile, color: "text-sentiment-negative", bg: "bg-sentiment-negative/10" },
  trend: { icon: TrendingUp, color: "text-sentiment-positive", bg: "bg-sentiment-positive/10" },
  spread: { icon: Globe2, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  alert: { icon: AlertTriangle, color: "text-sentiment-negative", bg: "bg-sentiment-negative/10" },
};

export default function Timeline() {
  const { data, loading, error, reload } = useAnalytics(getTimelineData);
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Timeline Explorer
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          See exactly how a conversation evolves, minute by minute.
        </p>
      </div>

      {loading && <Loading label="Reconstructing timeline..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <div className="panel p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Horizontal line with event nodes */}
            <div className="relative flex items-start justify-between px-4">
              <div className="absolute top-5 left-0 right-0 h-px bg-base-border" />
              {data.events.map((evt) => {
                const config = EVENT_CONFIG[evt.type] || EVENT_CONFIG.post;
                const Icon = config.icon;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="relative z-10 flex flex-col items-center gap-2 group w-24 shrink-0"
                  >
                    <span className={`w-10 h-10 rounded-full ${config.bg} border border-base-border flex items-center justify-center group-hover:border-accent-cyan/50 transition-colors`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </span>
                    <span className="text-xs font-mono text-ink-muted">{evt.time}</span>
                    <span className="text-xs text-ink-secondary text-center leading-tight group-hover:text-ink-primary">
                      {evt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title}>
        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <p className="text-ink-muted font-mono">{selectedEvent.time}</p>
            <p className="text-ink-primary leading-relaxed">{selectedEvent.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
