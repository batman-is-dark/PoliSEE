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
        
        return {
            "history": history,
            "analysis": analysis
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
