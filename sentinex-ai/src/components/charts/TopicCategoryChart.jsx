import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const p = payload[0].payload;

  return (
    <div className="panel px-3 py-2 text-xs min-w-[180px]">
      <p className="text-ink-primary font-medium mb-1">
        {p.category}
      </p>

      <p className="text-accent-cyan">
        {p.value}% · {p.count?.toLocaleString("en-IN")} posts
      </p>

      {p.topics?.length > 0 && (
        <p className="text-ink-muted mt-1 leading-relaxed">
          {p.topics.slice(0, 5).join(", ")}
        </p>
      )}
    </div>
  );
}

export default function TopicCategoryChart({
  data = [],
  height = 300,
}) {
  if (!data.length) {
    return (
      <p className="text-sm text-ink-muted text-center py-8">
        No topic categories detected yet.
      </p>
    );
  }

  // Sort largest → smallest
  const chartData = [...data]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 12);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 5,
        }}
      >
        <XAxis
          type="number"
          domain={[0, "dataMax"]}
          tick={{
            fill: "#94a3b8",
            fontSize: 10,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          type="category"
          dataKey="category"
          width={150}
          tick={{
            fill: "#cbd5e1",
            fontSize: 10,
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
        />

        <Bar
          dataKey="count"
          radius={[0, 5, 5, 0]}
          barSize={16}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.category}
              fill={entry.color || "#22d3ee"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}