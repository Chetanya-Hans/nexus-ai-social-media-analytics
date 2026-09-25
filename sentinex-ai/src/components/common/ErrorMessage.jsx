import { AlertCircle, RefreshCcw } from "lucide-react";

// Generic error state with an optional retry action.
export default function ErrorMessage({ message = "Failed to load data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <AlertCircle className="w-6 h-6 text-sentiment-negative" />
      <p className="text-sm text-ink-secondary max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-base-surface2 border border-base-border hover:border-accent-cyan/50 transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
