import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LINE_COLORS = ["#22d3ee", "#a855f7", "#f59e0b", "#22c55e"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel px-3 py-2 text-xs">
      <p className="text-ink-muted font-mono mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// Multi-series line chart showing how several trends grow in volume over time.
// `series` = array of series keys to plot, e.g. ["AI Phone Update", "Battery Issue"]
export default function TrendChart({ data, series, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "#5b6579", fontSize: 11 }} axisLine={{ stroke: "#1c2436" }} tickLine={false} />
        <YAxis tick={{ fill: "#5b6579", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        {series.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
