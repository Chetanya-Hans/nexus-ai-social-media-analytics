export default function ActivityHeatmap({ data = [] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="grid grid-cols-12 gap-1.5">
        {data.map((item) => {
          const intensity = item.value / maxValue;
          return (
            <div key={item.hour} className="flex flex-col items-center gap-1">
              <div
                className="w-full aspect-square rounded-md border border-base-border transition-colors"
                style={{
                  backgroundColor: `rgba(34, 211, 238, ${0.08 + intensity * 0.72})`,
                }}
                title={`${item.hour}:00 — activity ${item.value}%`}
              />
              <span className="text-[9px] font-mono text-ink-muted">
                {item.hour % 6 === 0 ? `${item.hour}h` : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-ink-muted">
        <span>Low activity</span>
        <div className="flex gap-1">
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((opacity) => (
            <span
              key={opacity}
              className="w-4 h-3 rounded-sm border border-base-border"
              style={{ backgroundColor: `rgba(34, 211, 238, ${opacity})` }}
            />
          ))}
        </div>
        <span>Peak activity</span>
      </div>
    </div>
  );
}
