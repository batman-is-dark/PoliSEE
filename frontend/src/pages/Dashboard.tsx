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
  ShieldAlert,
  Languages,
  Globe
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
  const [languageMode, setLanguageMode] = useState<"layman" | "technical">("layman");
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    if (policyType === "housing_rent_subsidy") {
      setParams({ subsidy_amount: 200, eligibility_threshold: 1000 });
    } else if (policyType === "fuel_tax_rebate") {
      setParams({ tax_rate: 0.2, rebate_percent: 0.9 });
    } else if (policyType === "food_price_ceiling") {
      setParams({ price_cap: 5.0 });
    } else if (policyType === "luxury_asset_tax") {
      setParams({ tax_rate: 0.05, wealth_threshold: 2000 });
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

  const exportToCSV = () => {
    if (!history || history.length === 0) return;

    const headers = ['Step', 'Average Price', 'Gini Index', 'Compliance Rate', 'Average Stress'];
    const csvContent = [
      headers.join(','),
      ...history.map(row => [
        row.step,
        row.avg_price.toFixed(2),
        row.gini.toFixed(4),
        row.compliance_rate.toFixed(4),
        row.avg_stress.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `polisee-simulation-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUCIColor = (uci: number) => {
    if (uci < 0.3) return "text-emerald-400";
    if (uci < 0.6) return "text-amber-400";
    return "text-rose-400";
  };

  const pct = (value: number, min: number, max: number) => {
    const v = Number(value ?? 0);
    const m = Number(min ?? 0);
    const M = Number(max ?? 1);
    if (M === m) return 0;
    return Math.max(0, Math.min(100, ((v - m) / (M - m)) * 100));
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans relative">
      {/* Cinematic background similar to LandingPage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-cyan/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent-gold/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col z-20"
      >
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity size={20} className="text-white" />
          </div>
          <Link to="/" className="text-2xl font-display font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            poliSEE
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <section>
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Settings2 size={12} />
              <span>Configuration</span>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Policy Class</label>
                <div className="relative group">
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer group-hover:bg-white/10"
                  >
                    <option value="housing_rent_subsidy">Housing Rent Subsidy</option>
                    <option value="fuel_tax_rebate">Fuel Tax with Rebates</option>
                    <option value="food_price_ceiling">Food Price Ceiling</option>
                    <option value="luxury_asset_tax">Luxury Asset Tax</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                    <ChevronRight className="rotate-90" size={16} />
                  </div>
                </div>
              </div>

              {/* Dynamic Params */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={policyType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {policyType === "housing_rent_subsidy" && (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Subsidy Amount</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${params.subsidy_amount}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={params.subsidy_amount || 200}
                          onChange={(e) => setParams({ ...params, subsidy_amount: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.subsidy_amount||200,0,1000)}%, rgba(255,255,255,0.04) ${pct(params.subsidy_amount||200,0,1000)}%)` }}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Eligibility Threshold</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${params.eligibility_threshold}</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="5000"
                          step="100"
                          value={params.eligibility_threshold || 1000}
                          onChange={(e) => setParams({ ...params, eligibility_threshold: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.eligibility_threshold||1000,500,5000)}%, rgba(255,255,255,0.04) ${pct(params.eligibility_threshold||1000,500,5000)}%)` }}
                        />
                      </div>
                    </>
                  )}

                  {policyType === "fuel_tax_rebate" && (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Tax Rate</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{(params.tax_rate * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={params.tax_rate || 0.2}
                          onChange={(e) => setParams({ ...params, tax_rate: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.tax_rate||0.2,0,1)}%, rgba(255,255,255,0.04) ${pct(params.tax_rate||0.2,0,1)}%)` }}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Rebate Percent</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{(params.rebate_percent * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={params.rebate_percent || 0.9}
                          onChange={(e) => setParams({ ...params, rebate_percent: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.rebate_percent||0.9,0,1)}%, rgba(255,255,255,0.04) ${pct(params.rebate_percent||0.9,0,1)}%)` }}
                        />
                      </div>
                    </>
                  )}

                  {policyType === "food_price_ceiling" && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white/40 uppercase tracking-wider">Price Cap</span>
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${params.price_cap}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={params.price_cap || 5.0}
                        onChange={(e) => setParams({ ...params, price_cap: Number(e.target.value) })}
                        className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.price_cap||5.0,1,20)}%, rgba(255,255,255,0.04) ${pct(params.price_cap||5.0,1,20)}%)` }}
                      />
                    </div>
                  )}

                  {policyType === "luxury_asset_tax" && (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Tax Rate</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{(params.tax_rate * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.2"
                          step="0.01"
                          value={params.tax_rate || 0.05}
                          onChange={(e) => setParams({ ...params, tax_rate: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.tax_rate||0.05,0,0.2)}%, rgba(255,255,255,0.04) ${pct(params.tax_rate||0.05,0,0.2)}%)` }}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white/40 uppercase tracking-wider">Wealth Threshold</span>
                          <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${params.wealth_threshold}</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="10000"
                          step="500"
                          value={params.wealth_threshold || 2000}
                          onChange={(e) => setParams({ ...params, wealth_threshold: Number(e.target.value) })}
                          className="range-slider w-full accent-indigo-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(90deg,#7c3aed ${pct(params.wealth_threshold||2000,500,10000)}%, rgba(255,255,255,0.04) ${pct(params.wealth_threshold||2000,500,10000)}%)` }}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <button
                onClick={runSimulation}
                disabled={loading}
                className="premium-button w-full py-5 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Info size={14} className="text-indigo-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">System Status</span>
          </div>
          <p className="text-[11px] text-white/30 leading-relaxed font-medium">
            Simulation engine active. Modeling 1,000 agents across 5 neighborhoods.
          </p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/10 backdrop-blur-3xl z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight">Simulation Dashboard</h2>
              <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.3em] opacity-70">PoliSEE Simulation Lab / Core v1.0</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Engine
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setShowMethodology(true)}
              className="method-button flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle size={18} className="transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Methodology</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-500/20">PA</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">PoliSEE Analyst</span>
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">Senior Researcher</span>
              </div>
            </div>
          </div>
        </header>

      {/* Methodology Modal */}
      <AnimatePresence>
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMethodology(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0d0d0f] border border-white/10 rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-accent-cyan text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Technical Documentation</div>
                  <h3 className="text-3xl font-bold">Simulation Methodology</h3>
                </div>
                <button 
                  onClick={() => setShowMethodology(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronRight className="rotate-90" />
                </button>
              </div>
              
              <div className="space-y-8 text-white/60 leading-relaxed">
                <section>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Users size={16} className="text-indigo-400" />
                    Agent-Based Modeling (ABM)
                  </h4>
                  <p>
                    Our engine simulates 1,000 individual agents, each with unique income levels, consumption preferences, and social networks. Unlike aggregate models, ABM allows us to observe emergent behaviors like shadow markets and localized price spirals.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-accent-gold" />
                    Feedback Loops & Distortions
                  </h4>
                  <p>
                    Every policy intervention includes a "Distortion Mechanism." For example, a rent subsidy doesn't just increase income; it also signals landlords to adjust prices based on perceived demand elasticity, modeling the real-world capture of subsidies by supply-side actors.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    Unintended Consequence Index (UCI)
                  </h4>
                  <p>
                    The UCI is a composite metric calculated using the variance of price acceleration, Gini coefficient shifts, and compliance instability. A high UCI indicates that the policy's side effects are outweighing its intended benefits.
                  </p>
                </section>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">PoliSEE Research Initiative © 2025</div>
                  <button 
                    onClick={() => setShowMethodology(false)}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors"
                  >
                    Close Documentation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                  className="glass-card p-8 hover:bg-white/[0.06] transition-all group relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors shadow-inner">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">{stat.label}</div>
                  <div className={`text-3xl font-bold tracking-tight relative z-10 ${stat.color || ''}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 glass-card p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Market Dynamics</h3>
                    <p className="text-xs font-medium text-white/30 uppercase tracking-widest">Price and stress evolution over 24 months</p>
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      onClick={exportToCSV}
                      disabled={!history || history.length === 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                    >
                      Export CSV
                    </motion.button>
                  </div>
                </div>
                <div className="h-[450px]">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/20">Loading Visualizer...</div>}>
                    <Charts history={history} />
                  </Suspense>
                </div>
              </div>

              {/* Analysis Panel */}
              <div className="space-y-10">
                <div className="bg-gradient-to-br from-indigo-600/90 to-purple-700/90 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group border border-white/10">
                  <div className="absolute -right-10 -top-10 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Zap size={200} />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 relative z-10 flex items-center gap-3">
                    AI Insights
                    {languageMode === "technical" && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest">Technical</span>}
                  </h3>
                  <div className="text-white/90 text-sm leading-relaxed mb-8 relative z-10 font-medium">
                    {languageMode === "technical" ? (
                      <div className="space-y-5">
                        {analysis ? (
                          <>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">UCI Score</div>
                                <div className="font-mono text-lg">{analysis.unintended_consequence_index.toFixed(3)}</div>
                              </div>
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Acceleration</div>
                                <div className="font-mono text-lg">{analysis.metrics.price_acceleration.toFixed(3)}</div>
                              </div>
                            </div>
                            <div className="pt-5 border-t border-white/10">
                              <p className="text-xs text-white/70 leading-relaxed">{explanationText}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-white/40 italic">Run a simulation to generate detailed technical analysis.</p>
                        )}
                      </div>
                    ) : (
                      <p className="leading-relaxed">
                        {explanationText ?
                          explanationText.replace(/Rapid price acceleration detected/g, "Prices are rising quickly")
                            .replace(/score=/g, "at ")
                            .replace(/Prices may spiral if unchecked/g, "This could cause prices to keep going up out of control")
                            .replace(/Elevated price volatility observed/g, "Prices are changing a lot")
                            .replace(/Market instability may be emerging/g, "The market might become unstable")
                            .replace(/Consider phased implementation/g, "Think about rolling this out gradually")
                            .replace(/Compliance instability detected/g, "People aren't following the rules consistently")
                            .replace(/shadow-market behaviors/g, "underground or unofficial ways of doing things")
                            .replace(/Inequality is improving while stress rises/g, "Some people are doing better while others are struggling more")
                            .replace(/Target supply-side measures/g, "Focus on increasing what's available")
                            .replace(/temporary price supports/g, "short-term price help")
                            .replace(/Price behavior appears within expected bounds/g, "Prices are behaving normally")
                            .replace(/Compliance levels are stable/g, "People are following the rules consistently")
                          : "Run a simulation to see what might happen with this policy in plain terms."
                        }
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => setLanguageMode(languageMode === "layman" ? "technical" : "layman")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="premium-button tech-toggle w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all relative z-10 flex items-center justify-center gap-3"
                  >
                    <Languages size={16} />
                    {languageMode === "layman" ? "Technical Mode" : "Layman Mode"}
                  </motion.button>
                </div>

                <div className="glass-card p-10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    Recommendations
                  </h3>
                  <div className="space-y-5">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                            <ChevronRight size={18} />
                          </div>
                          <p className="text-xs font-medium text-white/50 group-hover:text-white/90 transition-colors leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-white/20 italic text-xs uppercase tracking-widest">
                        Awaiting Simulation Data
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Neighborhoods Grid */}
            <section>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold">Neighborhood Topology</h3>
                  <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-white/40 border border-white/10 uppercase tracking-widest">
                    N=5 DISTRICTS
                  </div>
                </div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                  Spatial Analysis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                {neighborhoods ? (
                  Object.entries(neighborhoods).map(([name, data]: [string, any]) => (
                    <motion.div
                      key={name}
                      whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.06)" }}
                      className="glass-card p-8 transition-all relative overflow-hidden group"
                    >
                      <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                        <Globe size={80} />
                      </div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6">{name}</div>
                      <div className="space-y-6">
                        <div>
                          <div className="text-3xl font-bold tracking-tight">${data.price.toFixed(1)}</div>
                          <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Market Price</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                            <span className="text-white/30">Supply Level</span>
                            <span className={data.supply < 0.3 ? "text-rose-400" : "text-emerald-400"}>
                              {Math.round(data.supply * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, data.supply * 100)}%` }}
                              className={`h-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${data.supply < 0.3 ? "bg-gradient-to-r from-rose-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                          <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Stability</div>
                          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${data.price > 300 ? "bg-amber-500 animate-pulse shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-64 glass-card animate-pulse" />
                  ))
                )}
              </div>
            </section>

            {/* Simulation Log / Console */}
            <section className="glass-card overflow-hidden border-white/5">
              <div className="px-10 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Engine Console Output</span>
                </div>
                <div className="text-[9px] font-mono text-white/20 font-bold tracking-widest">POLISEE_CORE_V1.0.0_STABLE</div>
              </div>
              <div className="p-10 font-mono text-[11px] space-y-3 max-h-64 overflow-y-auto custom-scrollbar bg-black/40">
                <div className="text-emerald-500/60 flex gap-3">
                  <span className="opacity-30">08:00:01</span>
                  <span>[SYSTEM] Initializing agent population (N=1000)...</span>
                </div>
                <div className="text-emerald-500/60 flex gap-3">
                  <span className="opacity-30">08:00:02</span>
                  <span>[SYSTEM] Calibrating neighborhood price elasticities...</span>
                </div>
                {history.length > 0 && (
                  <>
                    <div className="text-indigo-400/60 flex gap-3">
                      <span className="opacity-30">08:00:05</span>
                      <span>[POLICY] Applying {policyType.replace(/_/g, ' ')} intervention...</span>
                    </div>
                    <div className="text-white/40 flex gap-3">
                      <span className="opacity-30">08:00:10</span>
                      <span>[ENGINE] Step 1: Market equilibrium reached at avg_price=${history[0].avg_price.toFixed(2)}</span>
                    </div>
                    <div className="text-white/40 flex gap-3">
                      <span className="opacity-30">08:00:25</span>
                      <span>[ENGINE] Step 12: Mid-point analysis complete. Gini={history[11]?.gini.toFixed(3)}</span>
                    </div>
                    <div className="text-white/40 flex gap-3">
                      <span className="opacity-30">08:00:45</span>
                      <span>[ENGINE] Step 24: Simulation cycle finished. Generating emergence report...</span>
                    </div>
                    <div className="text-emerald-400 flex gap-3 font-bold">
                      <span className="opacity-30">08:00:46</span>
                      <span>[SUCCESS] Analysis complete. UCI={analysis?.unintended_consequence_index.toFixed(3)}</span>
                    </div>
                  </>
                )}
                {!loading && history.length === 0 && (
                  <div className="text-white/20 italic flex gap-3">
                    <span className="opacity-30">--:--:--</span>
                    <span>Waiting for simulation trigger...</span>
                  </div>
                )}
                {loading && (
                  <div className="text-indigo-400 animate-pulse flex gap-3">
                    <span className="opacity-30">--:--:--</span>
                    <span>[RUNNING] Processing stochastic matrices...</span>
                  </div>
                )}
              </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto mt-20 pb-12 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <Activity size={14} className="text-accent-cyan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">poliSEE</span>
                  <span className="text-[10px] text-white/20 uppercase tracking-widest">PoliSEE Research Initiative</span>
                </div>
              </div>
              <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
                <a href="#" className="hover:text-white transition-colors">API Reference</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
              <div className="text-[10px] font-mono text-white/20">
                © 2025 POLISEE RESEARCH INITIATIVE. ALL RIGHTS RESERVED.
              </div>
            </footer>
        </div>
      </div>
      </main>
    </div>
  );
};

export default Dashboard;
