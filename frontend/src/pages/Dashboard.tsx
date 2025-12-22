import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  Activity,
  AlertTriangle,
  Users,
  Info,
  ChevronRight,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldAlert
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

// Lazy load charts for performance
const Charts = React.lazy(() => import("../components/Charts"));

// --- Types ---
interface SimulationPoint {
  step: number;
  avg_price: number;
  gini: number;
  compliance_rate: number;
  avg_stress: number;
}

interface Alert {
  type: string;
  severity: string;
  mechanism: string;
}

interface Analysis {
  unintended_consequence_index: number;
  alerts: Alert[];
  metrics: {
    price_acceleration: number;
    volatility: number;
    compliance_instability: number;
  };
}

const Dashboard: React.FC = () => {
  const [policyType, setPolicyType] = useState("housing_rent_subsidy");
  const [params, setParams] = useState<Record<string, number>>({
    subsidy_amount: 200,
    eligibility_threshold: 1000,
  });
  const [history, setHistory] = useState<SimulationPoint[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<any>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (policyType === "housing_rent_subsidy") {
      setParams({ subsidy_amount: 200, eligibility_threshold: 1000 });
    } else if (policyType === "fuel_tax_rebate") {
      setParams({ tax_rate: 0.2, rebate_percent: 0.9 });
    } else if (policyType === "food_price_ceiling") {
      setParams({ price_cap: 5.0 });
    }
  }, [policyType]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const resp = await axios.post(`${apiUrl}/simulate`, {
        policy_type: policyType,
        params,
        steps: 24,
      });
      setHistory(resp.data.history);
      setAnalysis(resp.data.analysis);
      setNeighborhoods(resp.data.neighborhoods);
      setExplanationText(resp.data.explanation || "");
      setRecommendations(resp.data.recommendations || []);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const getUCIColor = (uci: number) => {
    if (uci < 0.3) return "text-emerald-400";
    if (uci < 0.6) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 border-r border-white/5 bg-[#0d0d0f] flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <Link to="/" className="text-xl font-display font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            poliSEE
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest mb-6">
              <Settings2 size={14} />
              <span>Configuration</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Policy Class</label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="housing_rent_subsidy">Housing Rent Subsidy</option>
                  <option value="fuel_tax_rebate">Fuel Tax with Rebates</option>
                  <option value="food_price_ceiling">Food Price Ceiling</option>
                </select>
              </div>

              {/* Dynamic Params */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={policyType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {policyType === "housing_rent_subsidy" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Subsidy Amount</span>
                          <span className="font-mono text-indigo-400">${params.subsidy_amount}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={params.subsidy_amount || 200}
                          onChange={(e) => setParams({ ...params, subsidy_amount: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Eligibility Threshold</span>
                          <span className="font-mono text-indigo-400">${params.eligibility_threshold}</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="5000"
                          step="100"
                          value={params.eligibility_threshold || 1000}
                          onChange={(e) => setParams({ ...params, eligibility_threshold: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {policyType === "fuel_tax_rebate" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Tax Rate</span>
                          <span className="font-mono text-indigo-400">{(params.tax_rate * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={params.tax_rate || 0.2}
                          onChange={(e) => setParams({ ...params, tax_rate: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Rebate Percent</span>
                          <span className="font-mono text-indigo-400">{(params.rebate_percent * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={params.rebate_percent || 0.9}
                          onChange={(e) => setParams({ ...params, rebate_percent: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {policyType === "food_price_ceiling" && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Price Cap</span>
                        <span className="font-mono text-indigo-400">${params.price_cap}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={params.price_cap || 5.0}
                        onChange={(e) => setParams({ ...params, price_cap: Number(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <button
                onClick={runSimulation}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={18} />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Info size={14} className="text-indigo-400" />
            </div>
            <span className="text-sm font-semibold">System Status</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Simulation engine active. Modeling 1,000 agents across 5 neighborhoods.
          </p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Simulation Dashboard</h2>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
              Live Engine
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer">
              <HelpCircle size={18} />
              <span className="text-sm font-medium">Guide</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
              <span className="text-sm font-semibold">Analyst Mode</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  label: "Avg Price", 
                  value: history?.length ? `$${history[history.length - 1].avg_price.toFixed(2)}` : "-",
                  trend: "+2.4%",
                  up: true,
                  icon: <Activity className="text-indigo-400" size={20} />
                },
                { 
                  label: "Compliance", 
                  value: history?.length ? `${(history[history.length - 1].compliance_rate * 100).toFixed(1)}%` : "-",
                  trend: "-0.8%",
                  up: false,
                  icon: <ShieldAlert className="text-emerald-400" size={20} />
                },
                { 
                  label: "Gini Index", 
                  value: history?.length ? history[history.length - 1].gini.toFixed(3) : "-",
                  trend: "+0.01",
                  up: true,
                  icon: <Users className="text-purple-400" size={20} />
                },
                { 
                  label: "UCI Score", 
                  value: analysis ? analysis.unintended_consequence_index.toFixed(2) : "-",
                  trend: "Critical",
                  up: true,
                  icon: <AlertTriangle className="text-rose-400" size={20} />,
                  color: analysis ? getUCIColor(analysis.unintended_consequence_index) : ""
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-white/40 text-sm font-medium mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold tracking-tight ${stat.color || ''}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Market Dynamics</h3>
                    <p className="text-sm text-white/40">Price and stress evolution over 24 months</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">Export CSV</button>
                    <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">Full View</button>
                  </div>
                </div>
                <div className="h-[400px]">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/20">Loading Visualizer...</div>}>
                    <Charts history={history} />
                  </Suspense>
                </div>
              </div>

              {/* Analysis Panel */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-600/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={120} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 relative z-10">AI Explanation</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 relative z-10">
                    {explanationText || "Run a simulation to generate a causal analysis of the policy impact."}
                  </p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all relative z-10">
                    Deep Dive Analysis
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-bold mb-6">Recommendations</h3>
                  <div className="space-y-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                          <p className="text-sm text-white/60 group-hover:text-white transition-colors leading-snug">
                            {rec}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-white/20 italic text-sm">
                        No recommendations available yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Neighborhoods Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Neighborhood Snapshots</h3>
                <span className="text-sm text-indigo-400 font-semibold cursor-pointer hover:underline">View All Districts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {neighborhoods ? (
                  Object.entries(neighborhoods).map(([name, data]: [string, any]) => (
                    <motion.div
                      key={name}
                      whileHover={{ y: -5 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{name}</div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold">${data.price.toFixed(1)}</div>
                          <div className="text-[10px] text-white/40">Current Price</div>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Math.min(100, (data.price / 500) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-white/40">SUPPLY</span>
                          <span className={data.supply < 20 ? "text-rose-400" : "text-emerald-400"}>
                            {data.supply.toFixed(0)} units
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
