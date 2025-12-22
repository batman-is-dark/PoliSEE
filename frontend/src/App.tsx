import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Settings2,
  Activity,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Users,
  Info,
} from "lucide-react";
import axios from "axios";

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

const App: React.FC = () => {
  const [policyType, setPolicyType] = useState("housing_rent_subsidy");
  const [params, setParams] = useState<Record<string, number>>({
    subsidy_amount: 200,
    eligibility_threshold: 1000,
  });
  const [history, setHistory] = useState<SimulationPoint[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

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
      const resp = await axios.post("http://localhost:8000/simulate", {
        policy_type: policyType,
        params,
        steps: 24,
      });
      setHistory(resp.data.history);
      setAnalysis(resp.data.analysis);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">poliSEE</div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Agent-Based Policy Simulator
        </p>

        <section style={{ marginTop: "20px" }}>
          <h3
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Settings2 size={18} /> Policy Parameters
          </h3>

          <div className="slider-container">
            <label>Policy Class</label>
            <select
              value={policyType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPolicyType(e.target.value)}
              style={{
                padding: "8px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "4px",
              }}
            >
              <option value="housing_rent_subsidy">Housing Rent Subsidy</option>
              <option value="fuel_tax_rebate">Fuel Tax with Rebates</option>
              <option value="food_price_ceiling">Food Price Ceiling</option>
            </select>
          </div>

          {policyType === "housing_rent_subsidy" && (
            <>
              <div className="slider-container">
                <label>Subsidy Amount: ${params.subsidy_amount}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={params.subsidy_amount || 200}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setParams({
                      ...params,
                      subsidy_amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="slider-container">
                <label>
                  Eligibility (Monthly Income): ${params.eligibility_threshold}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={params.eligibility_threshold || 1000}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setParams({
                      ...params,
                      eligibility_threshold: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}

          {policyType === "fuel_tax_rebate" && (
            <>
              <div className="slider-container">
                <label>Tax Rate: {(params.tax_rate * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.tax_rate || 0.2}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setParams({
                      ...params,
                      tax_rate: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="slider-container">
                <label>Rebate Percent: {(params.rebate_percent * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.rebate_percent || 0.9}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setParams({
                      ...params,
                      rebate_percent: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}

          {policyType === "food_price_ceiling" && (
            <>
              <div className="slider-container">
                <label>Price Cap: ${params.price_cap}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={params.price_cap || 5.0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setParams({
                      ...params,
                      price_cap: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}

          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "filter 0.2s",
            }}
          >
            {loading ? "Simulating..." : "Run Intervention"}
          </button>
        </section>

        <div
          style={{
            marginTop: "auto",
            padding: "16px",
            borderRadius: "8px",
            background: "rgba(59, 130, 246, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Info size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Causal Context
            </span>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Policies are modeled as interventions in a complex adaptive system.
            Every result is emergent from agent incentives.
          </p>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>System Overview</h2>
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              className="glass-card"
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Activity size={20} color="var(--accent-primary)" />
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Unintended Consequence Index
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color:
                      analysis?.unintended_consequence_index &&
                      analysis.unintended_consequence_index > 50
                        ? "var(--accent-critical)"
                        : "var(--text-primary)",
                  }}
                >
                  {analysis?.unintended_consequence_index || 0}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Charts Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
        >
          <div
            className="glass-card"
            style={{ padding: "20px", height: "300px" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TrendingUp size={18} /> Price Dynamics
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="step" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_price"
                  stroke="var(--accent-primary)"
                  strokeWidth={2}
                  dot={false}
                  name="Avg Rent/Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="glass-card"
            style={{ padding: "20px", height: "300px" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ShieldAlert size={18} /> Compliance & Stability
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="step" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="compliance_rate"
                  stroke="var(--accent-success)"
                  strokeWidth={2}
                  dot={false}
                  name="Compliance Rate"
                />
                <Line
                  type="monotone"
                  dataKey="avg_stress"
                  stroke="var(--accent-critical)"
                  strokeWidth={2}
                  dot={false}
                  name="Agent Stress"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Analysis */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <section>
            <h3
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={18} color="var(--accent-warning)" />{" "}
              Emergence Alerts
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {analysis?.alerts?.length === 0 && (
                <div
                  style={{
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No significant unintended consequences detected.
                </div>
              )}
              {analysis?.alerts?.map((alert, i) => (
                <div
                  key={i}
                  className={`alert-card ${
                    alert.severity === "Medium" ? "warning" : ""
                  }`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <strong style={{ fontSize: "1rem" }}>{alert.type}</strong>
                    <span
                      className={`badge ${
                        alert.severity === "Critical"
                          ? "badge-critical"
                          : "badge-warning"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {alert.mechanism}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card" style={{ padding: "20px" }}>
            <h3
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Users size={18} /> Social Metric: Gini Index
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="step" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0.2, 0.6]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gini"
                  stroke="var(--accent-warning)"
                  strokeWidth={2}
                  dot={false}
                  name="Inequality (Gini)"
                />
              </LineChart>
            </ResponsiveContainer>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "12px",
              }}
            >
              Measures wealth concentration. Note if inequality improves while
              side-effects worsen.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
