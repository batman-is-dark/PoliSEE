from typing import List, Dict, Any
from .simulation_engine import SimulationEngine
from .policy_definitions import Policy
import copy

class CounterfactualAnalyzer:
    """
    Runs the same population under multiple policy variants.
    Holds agent randomness constant for fair comparison.
    """
    def __init__(self, population_size: int = 100, seed: int = 42):
        self.population_size = population_size
        self.seed = seed

    def compare_policies(self, policies: List[Policy], steps: int = 24) -> Dict[str, Any]:
        """
        Runs multiple simulations and compares outcomes.
        """
        results = {}
        
        for i, policy in enumerate(policies):
            # Create a fresh engine with the same seed
            engine = SimulationEngine(population_size=self.population_size, seed=self.seed)
            engine.add_policy(policy)
            
            history = engine.run(steps)
            
            # Key metrics for comparison
            final_state = history[-1]
            results[f"policy_{i}_{policy.type.name}"] = {
                "history": history,
                "final_compliance": final_state["compliance_rate"],
                "final_inequality": final_state["gini"],
                "final_price": final_state["avg_price"],
                "final_stress": final_state["avg_stress"],
                "policy_params": {k: v.value for k, v in policy.parameters.items()}
            }
            
        return results

    def identify_dominance(self, results: Dict[str, Any]) -> str:
        """
        Heuristic to identify the 'best' policy based on multi-objective goals:
        High compliance, Low inequality, Low price inflation.
        """
        # Simplistic ranking
        rankings = []
        for name, data in results.items():
            score = (data["final_compliance"] * 2.0) - (data["final_inequality"] * 1.5) - (data["final_price"] * 0.1)
            rankings.append((name, score))
            
        rankings.sort(key=lambda x: x[1], reverse=True)
        return rankings[0][0] if rankings else "None"
