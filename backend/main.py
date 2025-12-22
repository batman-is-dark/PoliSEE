from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from simulation.simulation_engine import SimulationEngine
from simulation.policy_definitions import HousingRentSubsidy, FuelTaxWithRebate, FoodPriceCeiling
from simulation.emergence_detector import EmergenceDetector
from simulation.counterfactual_analysis import CounterfactualAnalyzer

app = FastAPI(title="poliSEE API", description="Public Policy Side-Effect Simulator")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    policy_type: str
    params: Dict[str, float]
    steps: int = 24
    population_size: int = 100

@app.get("/")
async def root():
    return {"message": "poliSEE Backend is running"}

@app.post("/simulate")
async def run_simulation(request: SimulationRequest):
    try:
        engine = SimulationEngine(population_size=request.population_size)
        
        # Instantiate policy
        policy = None
        if request.policy_type == "housing_rent_subsidy":
            policy = HousingRentSubsidy(
                subsidy_amount=request.params.get("subsidy_amount", 200),
                eligibility_threshold=request.params.get("eligibility_threshold", 1000)
            )
        elif request.policy_type == "fuel_tax_rebate":
            policy = FuelTaxWithRebate(
                tax_rate=request.params.get("tax_rate", 0.2),
                rebate_percent=request.params.get("rebate_percent", 0.9)
            )
        elif request.policy_type == "food_price_ceiling":
            policy = FoodPriceCeiling(
                price_cap=request.params.get("price_cap", 5.0)
            )
        
        if policy:
            engine.add_policy(policy)
            
        history = engine.run(request.steps)
        
        # Detect unintended consequences
        detector = EmergenceDetector()
        analysis = detector.analyze(history)

        # Provide neighborhood snapshots for debugging/visualization
        neighborhoods = engine.env.neighborhoods

        # Build a richer plain-language explanation and recommendations
        def build_explanation(analysis: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
            msgs: List[str] = []
            recs: List[str] = []

            metrics = analysis.get("metrics", {})
            price_accel = metrics.get("price_acceleration", 0)
            vol = metrics.get("volatility", 0)
            comp_instab = metrics.get("compliance_instability", 0)

            latest = history[-1] if history else {}
            latest_price = latest.get("avg_price")
            latest_compliance = latest.get("compliance_rate")

            if price_accel > 0.5:
                msgs.append(f"Rapid price acceleration detected (score={price_accel}). Prices may spiral if unchecked.")
                recs.append("Reduce subsidy magnitude or increase housing supply interventions to cool price pressures.")
            elif vol > 0.3:
                msgs.append(f"Elevated price volatility observed (volatility={vol}). Market instability may be emerging.")
                recs.append("Consider phased implementation and monitoring to avoid sudden shocks.")
            else:
                msgs.append("Price behavior appears within expected bounds for this scenario.")

            if comp_instab > 0.1:
                msgs.append("Compliance instability detected — watch for shadow-market behaviors.")
                recs.append("Increase enforcement visibility and reduce incentives for evasion.")
            else:
                msgs.append("Compliance levels are stable in recent steps.")

            # Stress vs inequality
            # Use a simple trend check: if UCI flagged stress decoupling earlier, mention it
            if any(a.get("type") == "Stress Decoupling" for a in analysis.get("alerts", [])):
                msgs.append("Inequality is improving while stress rises — this can indicate supply shortages affecting well-being.")
                recs.append("Target supply-side measures or temporary price supports for essentials.")

            # Summary line with latest metrics
            summary_parts = []
            if latest_price is not None:
                summary_parts.append(f"Latest avg price: {latest_price:.2f}.")
            if latest_compliance is not None:
                summary_parts.append(f"Latest compliance: {int(round(latest_compliance * 100))}%.")

            explanation_text = " ".join(msgs + summary_parts)
            return {"text": explanation_text, "recommendations": recs}

        explain = build_explanation(analysis, history)

        return {
            "history": history,
            "analysis": analysis,
            "neighborhoods": neighborhoods,
            "explanation": explain.get("text", ""),
            "recommendations": explain.get("recommendations", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare")
async def compare_policies(request: List[SimulationRequest]):
    # Simplified multi-policy comparison
    analyzer = CounterfactualAnalyzer(population_size=100)
    policies = []
    
    for req in request:
        if req.policy_type == "housing_rent_subsidy":
            policies.append(HousingRentSubsidy(**req.params))
        # Add others...
        
    results = analyzer.compare_policies(policies)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
