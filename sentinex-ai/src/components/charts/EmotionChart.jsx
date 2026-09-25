import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#22d3ee",
  "#a855f7",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="panel px-3 py-2 text-xs">
      <p className="text-ink-primary font-medium">
        {label}
      </p>

      <p className="text-ink-muted">
        {payload[0].value.toLocaleString("en-IN")} posts
      </p>
    </div>
  );
}

export default function EmotionChart({
  data = [],
  dataKey = "name",
  height = 280,
  layout = "vertical",
}) {
  // Unknown means the emotion has not been classified yet.
  // Do not display it as an actual emotion.
  const classifiedData = data.filter(
    (item) =>
      String(item[dataKey] ?? "")
        .trim()
        .toLowerCase() !== "unknown"
  );

  const chartData = classifiedData.map((item) => ({
    ...item,
    [dataKey]: item[dataKey],
    value: item.value ?? item.count ?? 0,
  }));

  const classifiedTotal = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  if (!chartData.length) {
    return (
      <div className="text-sm text-ink-muted text-center py-8">
        No classified emotions available yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout={layout}
          margin={{
            top: 5,
            right: 20,
            left: layout === "vertical" ? 10 : -10,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1c2436"
            horizontal={layout === "horizontal"}
            vertical={layout === "vertical"}
          />

          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                tick={{
                  fill: "#5b6579",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <YAxis
                dataKey={dataKey}
                type="category"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={dataKey}
                type="category"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="number"
                tick={{
                  fill: "#5b6579",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
            </>
          )}

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: "rgba(255,255,255,0.03)",
            }}
          />

          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={entry[dataKey] ?? i}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 text-[11px] text-ink-muted text-center">
        Based on {classifiedTotal.toLocaleString("en-IN")} emotion-classified posts
      </div>
    </div>
  );
}