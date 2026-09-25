import Badge from "../common/Badge";

const SENTIMENT_TONE = { positive: "positive", negative: "negative", neutral: "neutral" };

// Compact ranked trend row - used in the Overview "Trending Topics" list.
export default function TrendCard({ rank, topic, category, growth, mentions, sentiment, onClick }) {
  const isPositiveGrowth = growth.trim().startsWith("+");
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-base-surface2 transition-colors text-left group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 h-6 shrink-0 rounded-md bg-base-surface2 border border-base-border flex items-center justify-center text-xs font-mono text-ink-muted group-hover:border-accent-cyan/40">
          {rank}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-ink-primary font-medium truncate">{topic}</p>
          <p className="text-xs text-ink-muted truncate">
            {category && <span className="text-accent-cyan/80">{category} · </span>}
            {mentions?.toLocaleString?.("en-IN") ?? mentions} mentions
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {sentiment && <Badge tone={SENTIMENT_TONE[sentiment] || "default"}>{sentiment}</Badge>}
        <span className={`text-sm font-mono ${isPositiveGrowth ? "text-sentiment-positive" : "text-sentiment-negative"}`}>
          {growth}
        </span>
      </div>
    </button>
  );
}
