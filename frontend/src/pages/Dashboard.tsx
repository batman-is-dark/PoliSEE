import React, { useState, useEffect, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  Activity,
  AlertTriangle,
  Users,
  Info,
  ChevronRight,
  HelpCircle,
  Zap,
  ShieldAlert,
  LayoutDashboard,
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
  const [neighborhoods, setNeighborhoods] = useState<Record<string, { price: number; supply: number }> | null>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  // Modals
  const [showDeepContext, setShowDeepContext] = useState(false);
  const [showSpatialMap, setShowSpatialMap] = useState(false);
  const [showSimpleBriefing, setShowSimpleBriefing] = useState(false);

  useEffect(() => {
    if (policyType === "housing_rent_subsidy") {
      setParams({ subsidy_amount: 200, eligibility_threshold: 1000 });
    } else if (policyType === "luxury_asset_tax") {
      setParams({ tax_rate: 0.05, wealth_threshold: 2000 });
    } else if (policyType === "food_price_ceiling") {
      setParams({ price_cap: 5.0 });
    }
  }, [policyType]);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.post("http://localhost:8000/simulate", {
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
  }, [policyType, params]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const getSimpleSummary = () => {
    if (!analysis) return "No simulation data available yet. Please run a projection to see how this policy affects the market.";
    
    const uci = analysis.unintended_consequence_index;
    let summary = "";

    if (policyType === "housing_rent_subsidy") {
      summary = "By giving people money for rent, we've increased their ability to pay. However, because there aren't enough houses, landlords are simply raising prices to match the new subsidies. This means the money intended to help the poor is actually being captured by property owners.";
    } else if (policyType === "luxury_asset_tax") {
      summary = "Taxing high-value items can help fund the community, but if the tax is too high, wealthy individuals may choose to move their money elsewhere ('capital flight'). This can lead to a sudden drop in local asset values, potentially destabilizing the city's financial foundation.";
    } else {
      summary = "Setting a maximum price sounds helpful, but suppliers often stop selling when they can't make a profit. This leads to empty shelves and 'under-the-table' deals where people pay extra just to get what they need.";
    }

    if (uci > 0.6) {
      summary += " Warning: This policy is causing significant side effects that might outweigh the benefits.";
    }

    return summary;
  };

  const getUCIColor = (uci: number) => {
    if (uci < 0.3) return "text-emerald-400";
    if (uci < 0.6) return "text-solaris-gold";
    return "text-solaris-rose";
  };

  return (
    <div className="flex h-screen bg-solaris-bg text-slate-50 overflow-hidden font-sans">
      {/* Cinematic Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-solaris-cyan/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-solaris-gold/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        className="w-20 border-r border-white/5 bg-solaris-bg flex flex-col items-center py-8 z-20"
      >
        <Link to="/" className="w-10 h-10 mb-12 relative group">
          <div className="absolute inset-0 bg-solaris-cyan blur-md opacity-20 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative w-full h-full bg-solaris-bg border border-solaris-cyan/30 rounded-xl flex items-center justify-center">
            <Activity className="text-solaris-cyan" size={20} />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-8">
          {[
            { icon: <LayoutDashboard size={20} />, active: true },
          ].map((item, i) => (
            <button 
              key={i}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.active ? 'bg-white/5 text-solaris-cyan border border-white/10' : 'text-white/20 hover:text-white/60'}`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <Info size={16} />
        </button>
      </motion.aside>

      {/* Modals */}
      <AnimatePresence>
        {showDeepContext && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeepContext(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="solaris-glass max-w-2xl w-full p-10 bg-solaris-bg/80 border-solaris-cyan/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold text-solaris-cyan">Deep Context Analysis</h3>
                <button onClick={() => setShowDeepContext(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
              </div>
              <div className="space-y-6 text-white/70 leading-relaxed overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-solaris-cyan uppercase tracking-widest mb-3">Model Rationale</h4>
                  <p>{explanationText || "No simulation data available for deep analysis."}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Price Acceleration</div>
                      <div className="text-xl font-display font-bold">{(analysis?.metrics.price_acceleration.toFixed(4)) || "0.0000"}</div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Market Volatility</div>
                      <div className="text-xl font-display font-bold">{(analysis?.metrics.volatility.toFixed(4)) || "0.0000"}</div>
                   </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Alerts</h4>
                  {analysis?.alerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-solaris-rose/5 border border-solaris-rose/20 text-solaris-rose">
                      <AlertTriangle size={16} />
                      <div className="text-sm font-medium">[{alert.severity}] {alert.type} via {alert.mechanism}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSpatialMap && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSpatialMap(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="solaris-glass max-w-6xl w-full p-10 bg-solaris-bg/90 border-solaris-cyan/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-display font-bold">Full Spatial Map</h3>
                  <p className="text-white/40 text-sm mt-1">Cross-district valuation and supply metrics</p>
                </div>
                <button onClick={() => setShowSpatialMap(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">✕</button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                {neighborhoods ? Object.entries(neighborhoods).map(([name, data]) => (
                  <div key={name} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">{name}</div>
                    <div className="text-2xl font-display font-bold mb-4">${data.price.toFixed(1)}</div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-white/20 uppercase">Supply</span>
                         <span className={data.supply < 20 ? 'text-solaris-rose' : 'text-emerald-400'}>{data.supply.toFixed(0)}</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-solaris-cyan" style={{ width: `${Math.min(100, (data.price/500)*100)}%` }} />
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center text-white/20 font-display italic tracking-widest">Awaiting simulation data...</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSimpleBriefing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSimpleBriefing(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="solaris-glass max-w-lg w-full p-10 bg-solaris-bg/90 border-solaris-cyan/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-solaris-cyan/20 flex items-center justify-center text-solaris-cyan">
                      <HelpCircle size={18} />
                   </div>
                   <h3 className="text-xl font-display font-bold">Executive Briefing</h3>
                </div>
                <button onClick={() => setShowSimpleBriefing(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-white/90 leading-relaxed font-medium">
                  {getSimpleSummary()}
                </p>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                  <span>Policy Analysis Unit</span>
                  <span className="text-solaris-cyan tracking-normal lowercase italic text-xs">Simplified for Decision Makers</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel (Second Sidebar) */}
      <motion.section 
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-80 border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl flex flex-col z-10"
      >
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-2 text-solaris-cyan text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            <Settings2 size={12} />
            <span>Parameters</span>
          </div>
          <h2 className="text-2xl font-display font-bold">Policy Lab</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Simulation Type</label>
            <div className="relative">
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="w-full bg-solaris-bg border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-solaris-cyan/50 transition-all appearance-none cursor-pointer font-medium text-white"
              >
                <option value="housing_rent_subsidy" className="bg-solaris-bg text-white">Housing Rent Subsidy</option>
                <option value="luxury_asset_tax" className="bg-solaris-bg text-white">Luxury Asset Tax</option>
                <option value="food_price_ceiling" className="bg-solaris-bg text-white">Food Price Ceiling</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>

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
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Subsidy</span>
                      <span className="text-xl font-display font-medium text-solaris-cyan">${params.subsidy_amount}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={params.subsidy_amount || 200}
                      onChange={(e) => setParams({ ...params, subsidy_amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Threshold</span>
                      <span className="text-xl font-display font-medium text-solaris-cyan">${params.eligibility_threshold}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={params.eligibility_threshold || 1000}
                      onChange={(e) => setParams({ ...params, eligibility_threshold: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {policyType === "luxury_asset_tax" && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Asset Tax Rate</span>
                      <span className="text-xl font-display font-medium text-solaris-cyan">{(params.tax_rate * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.01"
                      value={params.tax_rate || 0.05}
                      onChange={(e) => setParams({ ...params, tax_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Wealth Threshold</span>
                      <span className="text-xl font-display font-medium text-solaris-cyan">${params.wealth_threshold || 2000}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={params.wealth_threshold || 2000}
                      onChange={(e) => setParams({ ...params, wealth_threshold: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {policyType === "food_price_ceiling" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Price Cap</span>
                    <span className="text-xl font-display font-medium text-solaris-cyan">${params.price_cap}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={params.price_cap || 5.0}
                    onChange={(e) => setParams({ ...params, price_cap: Number(e.target.value) })}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full relative group py-5 rounded-2xl overflow-hidden shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-solaris-cyan to-blue-600 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-center gap-3 text-black font-bold">
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  Run Projection
                </>
              )}
            </div>
          </button>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-0">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-solaris-bg/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-display font-bold text-white/90">Market Intelligence</h2>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Engine Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <HelpCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Protocols</span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-white/10">
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Authorized Analyst</div>
                <div className="text-sm font-bold">SOLARIS-01</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-solaris-cyan to-blue-600 p-0.5">
                <div className="w-full h-full bg-solaris-bg rounded-[10px] flex items-center justify-center overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=S&background=random" alt="Avatar" className="w-full h-full opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12 pb-12">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  label: "Market Price", 
                  value: history?.length ? `$${history[history.length - 1].avg_price.toFixed(2)}` : "-",
                  trend: "+2.4%",
                  up: true,
                  icon: <Activity className="text-solaris-cyan" size={18} />
                },
                { 
                  label: "Compliance", 
                  value: history?.length ? `${(history[history.length - 1].compliance_rate * 100).toFixed(1)}%` : "-",
                  trend: "-0.8%",
                  up: false,
                  icon: <ShieldAlert className="text-emerald-400" size={18} />
                },
                { 
                  label: "Equity (Gini)", 
                  value: history?.length ? history[history.length - 1].gini.toFixed(3) : "-",
                  trend: "+0.01",
                  up: true,
                  icon: <Users className="text-solaris-gold" size={18} />
                },
                { 
                  label: "UCI Coefficient", 
                  value: analysis ? analysis.unintended_consequence_index.toFixed(2) : "-",
                  trend: "Critical",
                  up: true,
                  icon: <AlertTriangle className="text-solaris-rose" size={18} />,
                  color: analysis ? getUCIColor(analysis.unintended_consequence_index) : ""
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="solaris-card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-solaris-cyan/30 transition-colors">
                      {stat.icon}
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-solaris-rose/10 text-solaris-rose'}`}>
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className={`text-3xl font-display font-bold tracking-tight ${stat.color || 'text-white'}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Visualizer and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 solaris-card p-8 border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1 underline decoration-solaris-cyan/30 underline-offset-8">Market Evolution</h3>
                    <p className="text-xs text-white/30 mt-2 font-medium">Temporal projection over 24 months simulation window</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">CSV</button>
                    <button className="px-4 py-2 bg-solaris-cyan/10 border border-solaris-cyan/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-solaris-cyan hover:bg-solaris-cyan/20 transition-all">Expand View</button>
                  </div>
                </div>
                <div className="h-[420px]">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/10 font-display italic tracking-[0.2em] animate-pulse">Initializing Visualizer...</div>}>
                    <Charts history={history} />
                  </Suspense>
                </div>
              </div>

              {/* Insights Column */}
              <div className="space-y-8">
                <div className="relative group solaris-card p-8 bg-gradient-to-br from-solaris-cyan/10 via-transparent to-transparent border-solaris-cyan/20 overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                    <Zap size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full bg-solaris-cyan shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
                      <h3 className="text-lg font-display font-bold tracking-tight">AI Insights</h3>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                      {explanationText || "Run a simulation to generate a causal analysis of the policy impact through the lens of Solaris Core."}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowDeepContext(true)}
                        className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] hover:bg-white/10 hover:border-solaris-cyan/30 transition-all text-solaris-cyan"
                      >
                        Deep Context
                      </button>
                      <button 
                        onClick={() => setShowSimpleBriefing(true)}
                        className="py-4 bg-solaris-cyan/10 border border-solaris-cyan/30 rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] hover:bg-solaris-cyan/20 transition-all text-solaris-cyan"
                      >
                        Layman's Brief
                      </button>
                    </div>
                  </div>
                </div>

                <div className="solaris-card p-8 bg-white/[0.01]">
                  <h3 className="text-lg font-display font-bold mb-8">Policy Directives</h3>
                  <div className="space-y-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-solaris-cyan/30 transition-all group">
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-solaris-cyan/10 flex items-center justify-center text-solaris-cyan group-hover:bg-solaris-cyan group-hover:text-black transition-all">
                            <ChevronRight size={16} />
                          </div>
                          <p className="text-xs text-white/50 group-hover:text-white/80 transition-colors leading-relaxed font-medium">
                            {rec}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-white/10 italic text-xs font-medium tracking-widest">
                        Awaiting data input...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Neighborhoods Area */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-display font-bold">District Topologies</h3>
                  <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Geo-Stratified</div>
                </div>
                <span 
                  onClick={() => setShowSpatialMap(true)}
                  className="text-[10px] text-solaris-cyan font-bold uppercase tracking-widest cursor-pointer hover:underline underline-offset-4"
                >
                  Full Spatial Map
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {neighborhoods ? (
                  Object.entries(neighborhoods).map(([name, data]) => (
                    <motion.div
                      key={name}
                      whileHover={{ y: -5 }}
                      className="solaris-card p-6 bg-white/[0.02] border-white/5"
                    >
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-6">{name}</div>
                      <div className="space-y-6">
                        <div>
                          <div className="text-3xl font-display font-bold text-white/90">${data.price.toFixed(1)}</div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Mean Valuation</div>
                        </div>
                        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-solaris-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]" 
                            style={{ width: `${Math.min(100, (data.price / 500) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-white/20 uppercase tracking-widest">Supply</span>
                          <span className={`px-2 py-0.5 rounded ${data.supply < 20 ? "text-solaris-rose bg-solaris-rose/5" : "text-emerald-400 bg-emerald-400/5"}`}>
                            {data.supply.toFixed(0)} Units
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-52 bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse" />
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
