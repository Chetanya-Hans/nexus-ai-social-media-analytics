import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22d3ee", "#3b82f6", "#a855f7", "#22c55e", "#f59e0b"];

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel px-3 py-2 text-xs">
      <p className="text-ink-primary font-medium">{label}</p>
      <p className="text-accent-cyan">{payload[0].value}%</p>
    </div>
  );
}

// Horizontal bar version - used for age, language, interests.
export function AudienceBarChart({ data, dataKey, valueKey = "value", height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#5b6579", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <YAxis dataKey={dataKey} type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Donut version - used for age distribution / location.
export function AudienceDonutChart({ data, dataKey, nameKey, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="panel px-3 py-2 text-xs">
                <p className="text-ink-primary font-medium">{p.name}</p>
                <p style={{ color: p.payload.fill }}>{p.value}%</p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
