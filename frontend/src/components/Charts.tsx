import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SimulationPoint {
  step: number;
  avg_price: number;
  gini: number;
  compliance_rate: number;
  avg_stress: number;
}

const CustomTooltip = ({ active, payload, label, dataKey }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Month {label}</p>
        <p className="text-sm font-bold text-white">
          {payload[0].name}: <span className="text-indigo-400">
            {dataKey === 'compliance_rate' ? `${(payload[0].value * 100).toFixed(1)}%` : payload[0].value.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const SmallChart: React.FC<{ title: string; dataKey: string; data: SimulationPoint[]; stroke: string; fill: string; domain?: any }> = ({ title, dataKey, data, stroke, fill, domain }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 h-[300px] hover:bg-white/[0.04] transition-all group">
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{title}</h4>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stroke }}></div>
    </div>
    <ResponsiveContainer width="100%" height="80%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="step" 
          stroke="rgba(255,255,255,0.1)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tick={{ fill: 'rgba(255,255,255,0.3)' }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.1)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          domain={domain}
          tick={{ fill: 'rgba(255,255,255,0.3)' }}
          tickFormatter={(v) => {
            if (dataKey === 'compliance_rate' && typeof v === 'number') {
              return `${Math.round(v * 100)}%`;
            }
            return typeof v === 'number' ? v.toFixed(1) : v;
          }}
        />
        <Tooltip content={<CustomTooltip dataKey={dataKey} />} />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          name={title}
          stroke={stroke} 
          strokeWidth={2} 
          fillOpacity={1} 
          fill={`url(#gradient-${dataKey})`}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Charts: React.FC<{ history: SimulationPoint[] }> = ({ history }) => {
  const data = history && history.length ? history : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SmallChart title="Price Index" dataKey="avg_price" data={data} stroke="#6366f1" fill="#6366f1" domain={["auto", "auto"]} />
      <SmallChart title="Compliance" dataKey="compliance_rate" data={data} stroke="#10b981" fill="#10b981" domain={[0, 1]} />
      <SmallChart title="Systemic Stress" dataKey="avg_stress" data={data} stroke="#f43f5e" fill="#f43f5e" domain={[0, "auto"]} />
    </div>
  );
};

export default Charts;
