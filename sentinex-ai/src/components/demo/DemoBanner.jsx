import { useState } from "react";
import { Shield, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function DemoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="panel border-accent-cyan/30 bg-gradient-to-r from-accent-cyan/5 via-accent-blue/5 to-accent-purple/5 p-4 sm:p-5 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-accent-cyan" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="label-eyebrow">NTRO · SIH Demo MVP</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-mono">
              PS #26152
            </span>
          </div>
          <h2 className="font-display font-semibold text-ink-primary text-lg">
            Social Media Analytics — AI-Driven Audience Intelligence
          </h2>
          <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
            Unified platform for multi-platform ingestion, sentiment &amp; emotion inference,
            demographic profiling, real-time trend detection, and influence network analysis.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              to="/data-sources"
              className="text-xs px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/20 transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" /> Data Pipeline
            </Link>
            <Link
              to="/ai-analyst"
              className="text-xs px-3 py-1.5 rounded-lg bg-base-surface2 text-ink-secondary border border-base-border hover:text-ink-primary transition-colors"
            >
              AI Analyst
            </Link>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-ink-muted hover:text-ink-primary shrink-0"
          aria-label="Dismiss demo banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
