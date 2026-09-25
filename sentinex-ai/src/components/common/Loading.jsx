import { Loader2 } from "lucide-react";

// Generic loading state - used inside cards, charts, tables, whole pages.
export default function Loading({ label = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted" role="status" aria-live="polite">
      <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
      <p className="text-sm font-mono">{label}</p>
    </div>
  );
}
