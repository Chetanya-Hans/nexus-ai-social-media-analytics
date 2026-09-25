import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { getTrendData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import TrendChart from "../components/charts/TrendChart";
import TopicCategoryChart from "../components/charts/TopicCategoryChart";
import { Flame, Sparkles, TrendingDown, Activity } from "lucide-react";

const STATUS_TONE = { Rising: "positive", Critical: "negative", Steady: "neutral", Declining: "warning" };
const SENTIMENT_TONE = { positive: "positive", negative: "negative", neutral: "neutral" };

export default function Trends() {
  const { data, loading, error, reload } = useAnalytics(getTrendData);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const detail = selectedTopic && data?.details?.[selectedTopic];
  const chartSeries = data?.leaderboard?.slice(0, 3).map((t) => t.topic) ?? [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Trend Intelligence
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Detect emerging narratives before they become mainstream.
        </p>
      </div>

      {loading && <Loading label="Scanning for emerging narratives..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Active Trends" value={data.stats.active} color="text-accent-cyan" />
            <StatCard icon={Sparkles} label="Emerging" value={data.stats.emerging} color="text-accent-purple" />
            <StatCard icon={Flame} label="Viral" value={data.stats.viral} color="text-sentiment-negative" />
            <StatCard icon={TrendingDown} label="Declining" value={data.stats.declining} color="text-ink-muted" />
          </div>

          {/* Velocity + categories */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-4">Trend Velocity</h3>
              <TrendChart data={data.velocitySeries} series={chartSeries} />
            </div>
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Topic Categories</h3>
              <p className="text-xs text-ink-muted mb-3">Narrative theme distribution</p>
              <TopicCategoryChart data={data.topicCategories} height={280} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="panel p-4 sm:p-5 overflow-x-auto">
            <h3 className="font-display font-semibold text-ink-primary mb-4">Trend Leaderboard</h3>
            {data.leaderboard.length === 0 ? (
              <EmptyState message="No trends detected in this time window." />
            ) : (
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="text-left text-ink-muted label-eyebrow border-b border-base-border">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Topic</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Growth</th>
                    <th className="pb-3 font-medium">Velocity</th>
                    <th className="pb-3 font-medium">Engagement</th>
                    <th className="pb-3 font-medium">Platforms</th>
                    <th className="pb-3 font-medium">Sentiment</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((row) => (
                    <tr
                      key={row.rank}
                      onClick={() => setSelectedTopic(row.topic)}
                      className="border-b border-base-border/60 last:border-0 hover:bg-base-surface2/60 cursor-pointer"
                    >
                      <td className="py-3 font-mono text-ink-muted">{row.rank}</td>
                      <td className="py-3 text-ink-primary font-medium">{row.topic}</td>
                      <td className="py-3 text-xs text-accent-cyan">{row.category ?? "—"}</td>
                      <td className={`py-3 font-mono ${row.growth.startsWith("+") ? "text-sentiment-positive" : "text-sentiment-negative"}`}>
                        {row.growth}
                      </td>
                      <td className="py-3 text-ink-secondary">{row.velocity}</td>
                      <td className="py-3 font-mono text-ink-secondary">{row.engagement}</td>
                      <td className="py-3 text-ink-secondary">{row.platforms.join(" + ")}</td>
                      <td className="py-3"><Badge tone={SENTIMENT_TONE[row.sentiment]}>{row.sentiment}</Badge></td>
                      <td className="py-3"><Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-xs text-ink-muted mt-3">Click a row to open the trend detail panel.</p>
          </div>
        </>
      )}

      {/* Trend detail modal */}
      <Modal open={!!selectedTopic} onClose={() => setSelectedTopic(null)} title={selectedTopic}>
        {detail ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="label-eyebrow">Growth</p>
                <p className="text-sentiment-positive font-mono">{detail.growth}</p>
              </div>
              <div>
                <p className="label-eyebrow">Mentions</p>
                <p className="font-mono text-ink-primary">{detail.mentionVolume}</p>
              </div>
              <div>
                <p className="label-eyebrow">Velocity</p>
                <p className="text-ink-primary">{detail.velocity}</p>
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-1.5">Platforms</p>
              <div className="flex gap-2 flex-wrap">
                {detail.platforms.map((p) => (
                  <Badge key={p} tone="info">{p}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-1.5">Sentiment split</p>
              <div className="flex gap-2">
                <Badge tone="positive">Positive {detail.sentiment.positive}%</Badge>
                <Badge tone="negative">Negative {detail.sentiment.negative}%</Badge>
                <Badge tone="neutral">Neutral {detail.sentiment.neutral}%</Badge>
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-1.5">Top keywords</p>
              <div className="flex gap-2 flex-wrap">
                {detail.keywords.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded-md bg-base-surface2 text-ink-secondary font-mono">
                    #{k}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-1.5">Related communities</p>
              <p className="text-ink-secondary">{detail.communities.join(", ")}</p>
            </div>

            <div>
              <p className="label-eyebrow mb-1.5">Top influencers</p>
              <p className="text-ink-secondary">{detail.influencers.join(", ")}</p>
            </div>

            <div className="panel p-3 bg-accent-cyan/5 border-accent-cyan/30">
              <p className="label-eyebrow mb-1">Prediction — next 6 hours</p>
              <p className="text-accent-cyan font-medium">{detail.prediction}</p>
            </div>
          </div>
        ) : (
          <EmptyState message="Detailed analytics for this trend are not available yet in the mock dataset." />
        )}
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="panel p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-base-surface2 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="label-eyebrow">{label}</p>
        <p className="text-xl font-display font-semibold text-ink-primary">{value}</p>
      </div>
    </div>
  );
}
