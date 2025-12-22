from simulation.simulation_engine import SimulationEngine
from simulation.policy_definitions import HousingRentSubsidy
from simulation.emergence_detector import EmergenceDetector
import json

def test_simulation():
    print("Initializing Simulation Engine...")
    engine = SimulationEngine(population_size=100, seed=42)
    
    # Apply a high subsidy to trigger a Price Spiral
    policy = HousingRentSubsidy(subsidy_amount=800, eligibility_threshold=2000)
    engine.add_policy(policy)
    
    print("Running 24 steps...")
    history = engine.run(24)
    
    print("Analyzing emergence...")
    detector = EmergenceDetector()
    analysis = detector.analyze(history)
    
    print("\n--- Simulation Results ---")
    print(f"Final Avg Price: {history[-1]['avg_price']:.2f}")
    print(f"Final Gini: {history[-1]['gini']:.4f}")
    print(f"Final Compliance: {history[-1]['compliance_rate']:.2f}")
    print(f"UCI Score: {analysis['unintended_consequence_index']}")
    
    print("\n--- Detected Alerts ---")
    for alert in analysis['alerts']:
        print(f"[{alert['type']}] ({alert['severity']}): {alert['mechanism']}")

if __name__ == "__main__":
    test_simulation()
