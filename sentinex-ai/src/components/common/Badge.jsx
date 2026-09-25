// Small pill label. `tone` controls the color scheme.
// tones: positive | negative | neutral | warning | info | default
const TONE_CLASSES = {
  positive: "bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/30",
  negative: "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/30",
  neutral: "bg-sentiment-neutral/10 text-sentiment-neutral border-sentiment-neutral/30",
  warning: "bg-sentiment-warning/10 text-sentiment-warning border-sentiment-warning/30",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  critical: "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/30",
  default: "bg-base-surface2 text-ink-secondary border-base-border",
};

export default function Badge({ children, tone = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${TONE_CLASSES[tone] || TONE_CLASSES.default} ${className}`}
    >
      {children}
    </span>
  );
}
