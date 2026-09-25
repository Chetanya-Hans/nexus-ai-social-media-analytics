import { useMemo, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { getAlertsData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import AlertCard from "../components/cards/AlertCard";
import Modal from "../components/common/Modal";

const FILTERS = ["All", "Critical", "Warning", "Resolved"];

export default function Alerts() {
  const { data, loading, error, reload } = useAnalytics(getAlertsData);
  const [filter, setFilter] = useState("All");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "All") return data.alerts;
    if (filter === "Resolved") return data.alerts.filter((a) => a.resolved);
    return data.alerts.filter((a) => a.severity === filter.toLowerCase() && !a.resolved);
  }, [data, filter]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="animate-fadeIn flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">Alerts</h1>
          <p className="text-sm text-ink-secondary mt-1">Critical signals that need your attention.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === f
                  ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                  : "border-base-border text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading label="Fetching alerts..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState message="No alerts match this filter." />
          ) : (
            filtered.map((alert) => (
              <AlertCard key={alert.id} {...alert} onView={() => setSelectedAlert(alert)} />
            ))
          )}
        </div>
      )}

      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Alert Details">
        {selectedAlert && (
          <div className="space-y-3 text-sm">
            <p className="text-ink-muted font-mono">{selectedAlert.time}</p>
            <p className="text-ink-primary leading-relaxed">{selectedAlert.description}</p>
            <p className="text-ink-muted">Affected topic: <span className="text-ink-primary">{selectedAlert.topic}</span></p>
            <p className="text-ink-muted">Severity: <span className="text-ink-primary capitalize">{selectedAlert.severity}</span></p>
            <p className="text-ink-muted">Status: <span className="text-ink-primary">{selectedAlert.resolved ? "Resolved" : "Active"}</span></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
