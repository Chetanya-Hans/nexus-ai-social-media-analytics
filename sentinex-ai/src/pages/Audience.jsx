import { useAnalytics } from "../hooks/useAnalytics";
import { getAudienceData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { AudienceBarChart, AudienceDonutChart } from "../components/charts/AudienceChart";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import { Info } from "lucide-react";

export default function Audience() {
  const { data, loading, error, reload } = useAnalytics(getAudienceData);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Audience Intelligence
        </h1>
        <p className="text-sm text-ink-secondary mt-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          Estimated aggregate audience profile — derived from public engagement signals, not exact user facts.
        </p>
      </div>

      {loading && <Loading label="Profiling audience..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Age Distribution</h3>
              <p className="text-xs text-ink-muted mb-3">Estimated age brackets from behavioral signals</p>
              <AudienceDonutChart
                data={data.ageDistribution}
                dataKey="value"
                nameKey="group"
                height={280}
              />
            </div>

            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Location Distribution</h3>
              <p className="text-xs text-ink-muted mb-3">Geographic spread of the engaged audience</p>
              <AudienceBarChart data={data.locationDistribution} dataKey="location" height={280} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Language Distribution</h3>
              <p className="text-xs text-ink-muted mb-3">Languages represented in the audience</p>
              <AudienceBarChart data={data.languageDistribution} dataKey="language" height={280} />
            </div>

            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Peak Activity Hours</h3>
              <p className="text-xs text-ink-muted mb-4">24-hour engagement heatmap (IST)</p>
              <ActivityHeatmap data={data.activeHoursHeatmap} />
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <h3 className="font-display font-semibold text-ink-primary mb-1">Professional Interests</h3>
            <p className="text-xs text-ink-muted mb-4">Most common interests identified across the audience</p>
            <AudienceBarChart data={data.interestDistribution} dataKey="interest" height={300} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Age Brackets" value={data.ageDistribution.length} />
            <SummaryCard label="Locations" value={data.locationDistribution.length} />
            <SummaryCard label="Languages" value={data.languageDistribution.length} />
            <SummaryCard label="Interest Categories" value={data.interestDistribution.length} />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="panel p-4">
      <p className="label-eyebrow mb-1">{label}</p>
      <p className="text-2xl font-display font-semibold text-accent-cyan">{value}</p>
    </div>
  );
}
