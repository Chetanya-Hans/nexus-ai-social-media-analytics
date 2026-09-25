import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  MessageCircle,
  TrendingUp,
  Smile,
  Globe2,
  Hash,
} from "lucide-react";

import { getTopicIntelligence } from "../../services/api";

export default function TopicIntelligence({ topic }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!topic) {
      setData(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getTopicIntelligence(topic);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("Topic intelligence failed:", err);

        if (!cancelled) {
          setError("Unable to load topic intelligence.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [topic]);

  if (!topic) {
    return (
      <div className="panel p-6">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-cyan-400" />

          <div>
            <h3 className="font-display font-semibold text-ink-primary">
              Topic Intelligence
            </h3>

            <p className="text-xs text-ink-muted mt-1">
              Search and select a topic to inspect its conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="animate-pulse text-sm text-ink-muted">
          Analyzing {topic}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6">
        <div className="text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const trend = data.trend;

  const sentiment = data.sentiment || {};

  const emotions = data.emotion || [];

  const platforms = data.platforms || [];

  const relatedTopics = data.relatedTopics || [];

  return (
    <div className="space-y-4">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="panel p-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">

              <Hash
                size={20}
                className="text-cyan-400"
              />

              <h2 className="text-xl font-display font-bold text-ink-primary">
                {data.topic}
              </h2>

            </div>

            <p className="text-xs text-ink-muted mt-1">
              Dataset-derived topic intelligence
            </p>
          </div>

          {trend && (
            <div className="flex items-center gap-2">

              <TrendingUp
                size={18}
                className={
                  trend.growthRate >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              />

              <div className="text-right">

                <div
                  className={
                    trend.growthRate >= 0
                      ? "text-lg font-semibold text-emerald-400"
                      : "text-lg font-semibold text-red-400"
                  }
                >
                  {trend.growthRate >= 0 ? "+" : ""}
                  {trend.growthRate}%
                </div>

                <div className="text-xs text-ink-muted">
                  {trend.status}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>


      {/* ======================================================
          KPI ROW
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <MetricCard
          icon={MessageCircle}
          label="Mentions"
          value={data.mentions.toLocaleString("en-IN")}
        />

        <MetricCard
          icon={TrendingUp}
          label="Growth"
          value={
            trend
              ? `${trend.growthRate >= 0 ? "+" : ""}${trend.growthRate}%`
              : "N/A"
          }
        />

        <MetricCard
          icon={Globe2}
          label="Top Platform"
          value={
            platforms.length
              ? platforms[0].platform
              : "N/A"
          }
          subtitle={
            platforms.length
              ? `${platforms[0].percentage}% of mentions`
              : null
          }
        />

      </div>


      {/* ======================================================
          SENTIMENT + PLATFORM
          ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SENTIMENT */}

        <div className="panel p-5">

          <div className="flex items-center gap-2 mb-5">

            <Smile
              size={18}
              className="text-cyan-400"
            />

            <h3 className="font-display font-semibold text-ink-primary">
              Sentiment
            </h3>

          </div>

          <div className="space-y-4">

            <ProgressRow
              label="Positive"
              value={sentiment.positive?.percentage || 0}
              count={sentiment.positive?.count || 0}
            />

            <ProgressRow
              label="Negative"
              value={sentiment.negative?.percentage || 0}
              count={sentiment.negative?.count || 0}
            />

            <ProgressRow
              label="Neutral"
              value={sentiment.neutral?.percentage || 0}
              count={sentiment.neutral?.count || 0}
            />

          </div>

        </div>


        {/* PLATFORMS */}

        <div className="panel p-5">

          <div className="flex items-center gap-2 mb-5">

            <Globe2
              size={18}
              className="text-cyan-400"
            />

            <h3 className="font-display font-semibold text-ink-primary">
              Platform Distribution
            </h3>

          </div>

          <div className="space-y-4">

            {platforms.map((item) => (
              <ProgressRow
                key={item.platform}
                label={item.platform}
                value={item.percentage}
                count={item.count}
              />
            ))}

            {!platforms.length && (
              <p className="text-sm text-ink-muted">
                No platform data available.
              </p>
            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          EMOTION + TREND
          ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* EMOTION */}

        <div className="panel p-5">

          <div className="flex items-center gap-2 mb-5">

            <Activity
              size={18}
              className="text-cyan-400"
            />

            <h3 className="font-display font-semibold text-ink-primary">
              Emotion
            </h3>

          </div>

          <div className="space-y-3">

            {emotions.slice(0, 6).map((item) => (
              <div
                key={item.emotion}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-2">

                  <span className="text-sm text-ink-primary capitalize">
                    {item.emotion}
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <span className="text-xs text-ink-muted">
                    {item.count.toLocaleString("en-IN")}
                  </span>

                  <span className="text-sm font-semibold text-ink-primary w-14 text-right">
                    {item.percentage}%
                  </span>

                </div>

              </div>
            ))}

            {!emotions.length && (
              <p className="text-sm text-ink-muted">
                No emotion data available.
              </p>
            )}

          </div>

        </div>


        {/* TREND */}

        <div className="panel p-5">

          <div className="flex items-center gap-2 mb-5">

            <BarChart3
              size={18}
              className="text-cyan-400"
            />

            <h3 className="font-display font-semibold text-ink-primary">
              Trend Intelligence
            </h3>

          </div>

          {trend ? (
            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-ink-muted">
                  Status
                </span>

                <span className="text-sm font-semibold capitalize text-emerald-400">
                  {trend.status}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-ink-muted">
                  Current mentions
                </span>

                <span className="text-sm font-semibold text-ink-primary">
                  {trend.currentCount.toLocaleString("en-IN")}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-ink-muted">
                  Previous mentions
                </span>

                <span className="text-sm font-semibold text-ink-primary">
                  {trend.previousCount.toLocaleString("en-IN")}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-ink-muted">
                  Trend score
                </span>

                <span className="text-sm font-semibold text-cyan-400">
                  {trend.score}
                </span>

              </div>

            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              No trend data available for this topic.
            </p>
          )}

        </div>

      </div>


      {/* ======================================================
          RELATED TOPICS
          ====================================================== */}

      <div className="panel p-5">

        <div className="flex items-center gap-2 mb-4">

          <Hash
            size={18}
            className="text-cyan-400"
          />

          <h3 className="font-display font-semibold text-ink-primary">
            Related Topics
          </h3>

        </div>

        {relatedTopics.length ? (

          <div className="flex flex-wrap gap-2">

            {relatedTopics.map((item) => (
              <div
                key={item.topic}
                className="px-3 py-2 rounded-lg border border-base-border bg-base-subtle"
              >

                <div className="text-sm text-ink-primary">
                  {item.topic}
                </div>

                <div className="text-xs text-ink-muted mt-0.5">
                  {item.count.toLocaleString("en-IN")} mentions
                </div>

              </div>
            ))}

          </div>

        ) : (

          <div className="text-sm text-ink-muted">
            Related-topic discovery will populate as the
            dataset topic graph is enriched.
          </div>

        )}

      </div>

    </div>
  );
}


/* ============================================================
   SMALL COMPONENTS
   ============================================================ */

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
}) {
  return (
    <div className="panel p-5">

      <div className="flex items-center gap-3">

        <div className="p-2 rounded-lg bg-cyan-400/10">
          <Icon
            size={18}
            className="text-cyan-400"
          />
        </div>

        <div>

          <div className="text-xs text-ink-muted">
            {label}
          </div>

          <div className="text-xl font-display font-bold text-ink-primary">
            {value}
          </div>

          {subtitle && (
            <div className="text-xs text-ink-muted mt-0.5">
              {subtitle}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


function ProgressRow({
  label,
  value,
  count,
}) {
  return (
    <div>

      <div className="flex items-center justify-between mb-1.5">

        <span className="text-sm text-ink-primary">
          {label}
        </span>

        <span className="text-xs text-ink-muted">
          {value}% · {count.toLocaleString("en-IN")}
        </span>

      </div>

      <div className="h-2 rounded-full bg-base-subtle overflow-hidden">

        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{
            width: `${Math.min(value, 100)}%`,
          }}
        />

      </div>

    </div>
  );
}