import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SimulationPoint {
  step: number;
  avg_price: number;
  gini: number;
  compliance_rate: number;
  avg_stress: number;
}

const SmallChart: React.FC<{ title: string; dataKey: string; data: SimulationPoint[]; stroke: string; domain?: any }> = ({ title, dataKey, data, stroke, domain }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[280px]">
    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">{title}</h4>
    <ResponsiveContainer width="100%" height="85%">
      <LineChart data={data} margin={{ top: 0, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="step" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          domain={domain}
          tickFormatter={(v) => {
            if (dataKey === 'compliance_rate' && typeof v === 'number') {
              return `${Math.round(v * 100)}%`;
            }
            return typeof v === 'number' ? v.toFixed(1) : v;
          }}
        />
        <Tooltip
          contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
          itemStyle={{ color: "#fff" }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey as any} 
          stroke={stroke} 
          strokeWidth={3} 
          dot={false} 
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const Charts: React.FC<{ history: SimulationPoint[] }> = ({ history }) => {
  const data = history && history.length ? history : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SmallChart title="Price Dynamics" dataKey="avg_price" data={data} stroke="#6366f1" domain={["auto", "auto"]} />
      <SmallChart title="Compliance Rate" dataKey="compliance_rate" data={data} stroke="#10b981" domain={[0, 1]} />
      <SmallChart title="Avg Stress" dataKey="avg_stress" data={data} stroke="#f43f5e" domain={[0, "auto"]} />
    </div>
  );
};

export default Charts;
