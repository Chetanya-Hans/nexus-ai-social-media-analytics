import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { getSentimentData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import SentimentChart from "../components/charts/SentimentChart";
import EmotionChart from "../components/charts/EmotionChart";
import Badge from "../components/common/Badge";
import { AlertTriangle } from "lucide-react";
import { dateRangeOptions } from "../data/mockData";

export default function Sentiment() {
  const { data, loading, error, reload } = useAnalytics(getSentimentData);
  const [range, setRange] = useState(dateRangeOptions[2]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Sentiment Intelligence
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Understand how audiences feel and how sentiment changes over time.
        </p>
      </div>

      {loading && <Loading label="Analyzing sentiment..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {/* Top summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel p-4">
              <p className="label-eyebrow mb-2">Positive</p>
              <p className="text-2xl font-display font-semibold text-sentiment-positive">{data.summary.positive}%</p>
            </div>
            <div className="panel p-4">
              <p className="label-eyebrow mb-2">Negative</p>
              <p className="text-2xl font-display font-semibold text-sentiment-negative">{data.summary.negative}%</p>
            </div>
            <div className="panel p-4">
              <p className="label-eyebrow mb-2">Neutral</p>
              <p className="text-2xl font-display font-semibold text-sentiment-neutral">{data.summary.neutral}%</p>
            </div>
            <div className="panel p-4">
              <p className="label-eyebrow mb-2">Emotion Dominant</p>
              <p className="text-2xl font-display font-semibold text-accent-cyan">{data.summary.dominantEmotion}</p>
            </div>
          </div>

          {/* Sentiment shift alert */}
          <div className="panel border-sentiment-warning/40 p-4 sm:p-5 flex items-start gap-4 bg-sentiment-warning/5">
            <div className="w-10 h-10 rounded-lg bg-sentiment-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-sentiment-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink-primary font-medium">
                Negative sentiment on <span className="text-sentiment-warning">{data.shiftAlert.topic}</span> increased by{" "}
                {data.shiftAlert.change}% in the {data.shiftAlert.window}.
              </p>
              <div className="flex gap-6 mt-3 text-sm">
                <div>
                  <p className="label-eyebrow">Previous</p>
                  <p className="font-mono text-ink-secondary">{data.shiftAlert.previous}%</p>
                </div>
                <div>
                  <p className="label-eyebrow">Current</p>
                  <p className="font-mono text-sentiment-negative">{data.shiftAlert.current}%</p>
                </div>
                <div>
                  <p className="label-eyebrow">Change</p>
                  <p className="font-mono text-sentiment-warning">+{data.shiftAlert.change}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Large timeline with date filter */}
          <div className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-display font-semibold text-ink-primary">Sentiment Timeline</h3>
              <div className="flex gap-2 flex-wrap">
                {dateRangeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRange(opt)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      range === opt
                        ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                        : "border-base-border text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <SentimentChart data={data.timeline} height={340} />
          </div>

          {/* Emotion analysis */}
          <div className="panel p-4 sm:p-5">
            <h3 className="font-display font-semibold text-ink-primary mb-4">Emotion Analysis</h3>
            <EmotionChart data={data.emotions} dataKey="emotion" height={320} layout="vertical" />
          </div>

          {/* Sentiment by topic table */}
          <div className="panel p-4 sm:p-5 overflow-x-auto">
            <h3 className="font-display font-semibold text-ink-primary mb-4">Sentiment by Topic</h3>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-ink-muted label-eyebrow border-b border-base-border">
                  <th className="pb-3 font-medium">Topic</th>
                  <th className="pb-3 font-medium">Positive</th>
                  <th className="pb-3 font-medium">Negative</th>
                  <th className="pb-3 font-medium">Neutral</th>
                  <th className="pb-3 font-medium">Total Posts</th>
                </tr>
              </thead>
              <tbody>
                {data.byTopic.map((row) => (
                  <tr key={row.topic} className="border-b border-base-border/60 last:border-0 hover:bg-base-surface2/60">
                    <td className="py-3 text-ink-primary font-medium">{row.topic}</td>
                    <td className="py-3"><Badge tone="positive">{row.positive}%</Badge></td>
                    <td className="py-3"><Badge tone="negative">{row.negative}%</Badge></td>
                    <td className="py-3"><Badge tone="neutral">{row.neutral}%</Badge></td>
                    <td className="py-3 font-mono text-ink-secondary">{row.totalPosts.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
