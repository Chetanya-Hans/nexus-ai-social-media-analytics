import { Link } from "react-router-dom";
import {
  Database,
  Smile,
  Users,
  TrendingUp,
  Share2,
} from "lucide-react";

const CAPABILITIES = [
  {
    id: "A",
    title: "Data Collection",
    description: "Multi-platform ingestion pipeline with timestamped historical storage (X, Telegram + more).",
    icon: Database,
    to: "/data-sources",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
  },
  {
    id: "B",
    title: "Sentiment Inference",
    description: "NLP-driven emotion detection — sarcasm, anxiety, excitement, support & opposition.",
    icon: Smile,
    to: "/sentiment",
    color: "text-sentiment-positive",
    bg: "bg-sentiment-positive/10",
  },
  {
    id: "C",
    title: "Demographic Profiling",
    description: "Aggregate audience insights: age, geography, language & professional interests.",
    icon: Users,
    to: "/audience",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
  {
    id: "D",
    title: "Trend Detection",
    description: "Real-time narrative tracking with velocity scoring and predictive growth signals.",
    icon: TrendingUp,
    to: "/trends",
    color: "text-sentiment-warning",
    bg: "bg-sentiment-warning/10",
  },
  {
    id: "E",
    title: "Network Analysis",
    description: "Influence mapping, key opinion leaders, and cross-community information spread.",
    icon: Share2,
    to: "/network",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
];

export default function CapabilityGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-primary">Core Capabilities</h3>
        <span className="label-eyebrow">Problem Statement Requirements</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          return (
            <Link
              key={cap.id}
              to={cap.to}
              className="panel panel-hover p-4 group block"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-ink-muted border border-base-border rounded px-1.5 py-0.5">
                  {cap.id}
                </span>
                <div className={`w-7 h-7 rounded-md ${cap.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${cap.color}`} />
                </div>
              </div>
              <h4 className="text-sm font-semibold text-ink-primary group-hover:text-accent-cyan transition-colors">
                {cap.title}
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-3">
                {cap.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
