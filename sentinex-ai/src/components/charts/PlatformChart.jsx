import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PLATFORM_COLORS = [
  "#22d3ee",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const p = payload[0];
  const total = p.payload?.total ?? 0;
  const percentage = total
    ? ((p.value / total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="panel px-3 py-2 text-xs">
      <p className="text-ink-primary font-medium">
        {p.name}
      </p>

      <p style={{ color: p.payload.color }}>
        {p.value.toLocaleString("en-IN")} posts
      </p>

      <p className="text-ink-muted mt-1">
        {percentage}% of total
      </p>
    </div>
  );
}

export default function PlatformChart({ data = [], height = 260 }) {
  const total = data.reduce(
  (sum, item) => sum + (item.value ?? item.count ?? 0),
  0
);

const chartData = data.map((item, index) => ({
  name: item.name ?? item.platform,
  value: item.value ?? item.count ?? 0,
  total,
  color: PLATFORM_COLORS[index % PLATFORM_COLORS.length],
}));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="52%"
          outerRadius="80%"
          paddingAngle={4}
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.color}
            />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{
            fontSize: 12,
            color: "#94a3b8",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}