import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="panel px-3 py-2 text-xs">
      <p className="text-ink-muted font-mono mb-1">{label}</p>

      {payload.map((p) => (
        <p
          key={p.dataKey}
          style={{ color: p.color }}
          className="font-medium"
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function SentimentChart({ data, height = 300 }) {
  const chartData = (data ?? []).map((item) => ({
    time: item.date,
    positive: item.positive ?? 0,
    negative: item.negative ?? 0,
    neutral: item.neutral ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id="posGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#22c55e"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="#22c55e"
              stopOpacity={0}
            />
          </linearGradient>

          <linearGradient
            id="negGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#ef4444"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="#ef4444"
              stopOpacity={0}
            />
          </linearGradient>

          <linearGradient
            id="neuGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#94a3b8"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="#94a3b8"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1c2436"
          vertical={false}
        />

        <XAxis
  dataKey="time"
  tick={{ fill: "#5b6579", fontSize: 11 }}
  axisLine={{ stroke: "#1c2436" }}
  tickLine={false}
/>

        <YAxis
          tick={{
            fill: "#5b6579",
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{
            fontSize: 12,
            color: "#94a3b8",
          }}
        />

        <Area
          type="monotone"
          dataKey="negative"
          name="Negative"
          stroke="#ef4444"
          fill="url(#negGradient)"
          strokeWidth={2}
        />

        <Area
          type="monotone"
          dataKey="neutral"
          name="Neutral"
          stroke="#94a3b8"
          fill="url(#neuGradient)"
          strokeWidth={2}
        />

        <Area
          type="monotone"
          dataKey="positive"
          name="Positive"
          stroke="#22c55e"
          fill="url(#posGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}