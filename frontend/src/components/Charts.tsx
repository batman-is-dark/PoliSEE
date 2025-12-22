import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface SimulationPoint {
  step: number;
  avg_price: number;
  gini: number;
  compliance_rate: number;
  avg_stress: number;
}

const SmallChart: React.FC<{ title: string; dataKey: string; data: SimulationPoint[]; stroke: string; color: string; domain?: [number | string, number | string] }> = ({ title, dataKey, data, stroke, color, domain }) => (
  <div className="solaris-card p-6 h-[320px] bg-white/[0.01]">
    <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-6">{title}</h4>
    <ResponsiveContainer width="100%" height="80%">
      <AreaChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="step" 
          stroke="rgba(255,255,255,0.1)" 
          fontSize={9} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis
          stroke="rgba(255,255,255,0.1)"
          fontSize={9}
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
          contentStyle={{ 
            background: "rgba(8, 8, 10, 0.9)", 
            border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: 16, 
            fontSize: 11,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.4)"
          }}
          itemStyle={{ color: "#fff", fontWeight: "bold" }}
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
        />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          strokeWidth={2} 
          fillOpacity={1} 
          fill={`url(#gradient-${dataKey})`}
          animationDuration={2000}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Charts: React.FC<{ history: SimulationPoint[] }> = ({ history }) => {
  const data = history && history.length ? history : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SmallChart title="Valuation Curve" dataKey="avg_price" data={data} stroke="#00f0ff" color="#00f0ff" domain={["auto", "auto"]} />
      <SmallChart title="Compliance Index" dataKey="compliance_rate" data={data} stroke="#10b981" color="#10b981" domain={[0, 1]} />
      <SmallChart title="Stress Coefficient" dataKey="avg_stress" data={data} stroke="#ff2d55" color="#ff2d55" domain={[0, "auto"]} />
    </div>
  );
};

export default Charts;
