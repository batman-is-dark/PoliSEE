import numpy as np
from typing import List, Dict, Any

class EmergenceDetector:
    """
    Detects unintended consequences and phase transitions in simulation results.
    Uses rolling variance, autocorrelation, and change-point detection.
    """
    def __init__(self, window_size: int = 6):
        self.window_size = window_size

    def analyze(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes time-series history for 'signature' emergence patterns.
        """
        if len(history) < self.window_size * 2:
            return {"unintended_consequence_index": 0, "alerts": []}

        # Extract macro variables
        prices = np.array([h["avg_price"] for h in history])
        gini = np.array([h["gini"] for h in history])
        compliance = np.array([h["compliance_rate"] for h in history])
        stress = np.array([h["avg_stress"] for h in history])

        alerts = []
        scores = []

        # 1. Price Acceleration (Nonlinear price explosion)
        price_accel = self.detect_acceleration(prices)
        if price_accel > 0.5:
            alerts.append({
                "type": "Price Spiral",
                "severity": "High",
                "mechanism": "Housing subsidies and local supply constraints combined to drive nonlinear price inflation."
            })
            scores.append(price_accel * 40)

        # 2. Variance Explosion (Instability)
        price_volatility = self.detect_volatility_burst(prices)
        if price_volatility > 0.3:
            alerts.append({
                "type": "Market Instability",
                "severity": "Medium",
                "mechanism": "High variance in prices indicates the system is losing equilibrium."
            })
            scores.append(price_volatility * 20)

        # 3. Compliance Collapse (Sudden shift to shadow markets)
        compliance_drop = self.detect_sudden_drop(compliance)
        if compliance_drop > 0.2:
            alerts.append({
                "type": "Compliance Collapse",
                "severity": "Critical",
                "mechanism": "Policy incentives or peer influence triggered a phase transition into informal market activity."
            })
            scores.append(compliance_drop * 50)

        # 4. Stress Decoupling (Policy improves income but stress rises)
        stress_rise = self.detect_trend(stress)
        if stress_rise > 0 and self.detect_trend(gini) < 0:
             alerts.append({
                "type": "Stress Decoupling",
                "severity": "Medium",
                "mechanism": "Inequality is falling, but agent frustration is rising due to shortages or price caps."
            })
             scores.append(20)

        uci = min(100, sum(scores))
        
        return {
            "unintended_consequence_index": round(uci, 1),
            "alerts": alerts,
            "metrics": {
                "price_acceleration": round(price_accel, 2),
                "volatility": round(price_volatility, 2),
                "compliance_instability": round(compliance_drop, 2)
            }
        }

    def detect_acceleration(self, series: np.ndarray) -> float:
        """Measures if the rate of change is increasing (second derivative)."""
        diff1 = np.diff(series)
        diff2 = np.diff(diff1)
        if len(diff2) == 0: return 0.0
        # Normalized acceleration
        return float(np.mean(diff2[-(self.window_size):]) / (np.mean(series) + 1e-6))

    def detect_volatility_burst(self, series: np.ndarray) -> float:
        """Checks if recent variance is significantly higher than historical."""
        recent = np.std(series[-(self.window_size):])
        historical = np.std(series[:-(self.window_size)])
        if historical == 0: return 0.0
        return float(max(0, (recent / historical) - 1.0))

    def detect_sudden_drop(self, series: np.ndarray) -> float:
        """Detects a large negative jump relative to the mean."""
        if len(series) < 2: return 0.0
        recent_mean = np.mean(series[-(self.window_size):])
        prev_mean = np.mean(series[:-(self.window_size)])
        return float(max(0, prev_mean - recent_mean))

    def detect_trend(self, series: np.ndarray) -> float:
        """Returns the slope of a simple linear fit."""
        x = np.arange(len(series))
        slope, _ = np.polyfit(x, series, 1)
        return float(slope)
