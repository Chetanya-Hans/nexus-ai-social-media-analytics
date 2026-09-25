import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

// Extracts the leading numeric portion of a value string so we can animate it.
// e.g. "128,542" -> 128542, "68% Positive" -> 68, "8.42%" -> 8.42
function parseNumeric(value) {
  const match = String(value).match(/[\d,.]+/);
  if (!match) return null;
  return parseFloat(match[0].replace(/,/g, ""));
}

function formatLikeOriginal(original, current) {
  // Real backend returns numeric KPI values.
  if (typeof original === "number") {
    return Math.round(current).toLocaleString("en-IN");
  }

  // Handle string values from the old/mock frontend.
  if (typeof original !== "string") {
    return current;
  }

  const numMatch = original.match(/[\d,.]+/);

  if (!numMatch) {
    return original;
  }

  const suffix = original.slice(
    numMatch.index + numMatch[0].length
  );

  const prefix = original.slice(0, numMatch.index);

  const hasDecimal = numMatch[0].includes(".");
  const hasComma = numMatch[0].includes(",");

  let formatted = hasDecimal
    ? current.toFixed(2)
    : Math.round(current).toString();

  if (hasComma) {
    formatted = Math.round(current).toLocaleString("en-IN");
  }

  return `${prefix}${formatted}${suffix}`;
}

// KPI cards used on the Overview dashboard. Numbers count up on mount for polish.
export default function KPICard({ label, value, change, trend = "up", icon = "Activity" }) {
  const Icon = Icons[icon] || Icons.Activity;
  const target = parseNumeric(value);
  const [display, setDisplay] = useState(target === null ? value : 0);

  useEffect(() => {
    if (target === null) return;
    const duration = 900;
    const start = performance.now();
    let raf;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * progress;
      setDisplay(formatLikeOriginal(value, current));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isUp = trend === "up";

  return (
    <div className="panel panel-hover p-4 sm:p-5 animate-fadeIn">
      <div className="flex items-start justify-between mb-3">
        <span className="label-eyebrow">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent-cyan" />
        </div>
      </div>
      <p className="text-2xl sm:text-[26px] font-display font-semibold text-ink-primary leading-tight">
        {display}
      </p>
      {change && (
        <p className={`text-xs mt-1.5 font-mono ${isUp ? "text-sentiment-positive" : "text-sentiment-negative"}`}>
          {isUp ? "\u25B2" : "\u25BC"} {change}
        </p>
      )}
    </div>
  );
}
