import { useAnalytics } from "../hooks/useAnalytics";
import { getDataSources } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import Button from "../components/common/Button";
import { ArrowDown } from "lucide-react";

const PLATFORM_TIER = {
  X: "Essential",
  Telegram: "Essential",
  Instagram: "Desirable",
  Facebook: "Desirable",
  Reddit: "Add-on",
  YouTube: "Add-on",
};

const PLATFORM_ICON_COLOR = {
  X: "text-ink-primary",
  Telegram: "text-accent-blue",
  Reddit: "text-sentiment-warning",
  YouTube: "text-sentiment-negative",
  Instagram: "text-accent-purple",
  Facebook: "text-accent-blue",
};

const PIPELINE_STEPS = ["Platform", "API", "Data validation", "Normalization", "AI processing"];

export default function DataSources() {
  const { data, loading, error, reload } = useAnalytics(getDataSources);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">Data Sources</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Manage platform connections feeding the intelligence pipeline.
        </p>
      </div>

      {loading && <Loading label="Checking platform connections..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.sources.map((source) => {
              const connected = source.status === "connected";
              return (
                <div key={source.platform} className="panel panel-hover p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-display font-semibold ${PLATFORM_ICON_COLOR[source.platform] || "text-ink-primary"}`}>
                        {source.platform}
                      </h3>
                      {PLATFORM_TIER[source.platform] && (
                        <span className="text-[10px] font-mono text-ink-muted mt-0.5 block">
                          {PLATFORM_TIER[source.platform]}
                        </span>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-mono ${
                        connected ? "text-sentiment-positive" : "text-ink-muted"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-sentiment-positive animate-pulseSoft" : "bg-ink-muted"}`} />
                      {connected ? "Connected" : "Available"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Posts collected</span>
                      <span className="font-mono text-ink-primary">{source.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Last sync</span>
                      <span className="font-mono text-ink-primary">{source.lastSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">API status</span>
                      <span className={connected ? "text-sentiment-positive" : "text-ink-muted"}>{source.apiStatus}</span>
                    </div>
                  </div>

                  <Button variant={connected ? "secondary" : "primary"} className="w-full">
                    {connected ? "Manage" : "Configure"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Ingestion pipeline diagram */}
          <div className="panel p-5 sm:p-6">
            <h3 className="font-display font-semibold text-ink-primary mb-1">Unified Ingestion Pipeline</h3>
            <p className="text-xs text-ink-muted mb-6">How raw platform data becomes AI-ready intelligence.</p>
            <div className="flex flex-col items-center gap-2">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 w-full max-w-xs">
                  <div className="w-full text-center panel bg-base-surface2 border-accent-cyan/20 py-3 px-4">
                    <span className="text-sm text-ink-primary font-medium">{step}</span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && <ArrowDown className="w-4 h-4 text-accent-cyan/60" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
