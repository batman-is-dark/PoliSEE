import random
import numpy as np
from typing import List, Optional

class Agent:
    """
    A heterogeneous agent representing a consumer/citizen.
    Features: Bounded rationality, social influence, and stochastic behavior.
    """
    def __init__(
        self, 
        agent_id: int, 
        income: float, 
        consumption_need: float, 
        mobility: float, 
        risk_tolerance: float,
        social_influence_weight: float = 0.1,
        seed: Optional[int] = None
    ):
        self.id = agent_id
        self.income = income
        self.base_income = income
        self.consumption_need = consumption_need
        self.mobility = mobility
        self.risk_tolerance = risk_tolerance
        self.social_influence_weight = social_influence_weight
        
        # State variables
        self.wealth = income
        self.compliance_probability = 1.0 - (0.5 * (1.0 - risk_tolerance)) # Higher risk tolerance -> lower compliance
        self.is_eligible = False
        self.last_decision = "comply"
        self.stress_level = 0.0
        self.last_consumption = 0.0
        
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)

    def decide_consumption(self, price: float, availability: float) -> float:
        """
        Bounded rationality: Agents don't optimize perfectly.
        They try to meet their consumption_need but are constrained by wealth and price.
        """
        # Simplistic budget constraint with a 'buffer' for irrationality
        affordable_qty = self.wealth / max(0.1, price)
        target_qty = self.consumption_need * (1.1 - 0.2 * random.random()) # Stochastic need
        
        actual_qty = min(target_qty, affordable_qty, availability)
        self.wealth -= actual_qty * price
        self.last_consumption = actual_qty
        
        # Stress increases if need isn't met
        if actual_qty < self.consumption_need * 0.8:
            self.stress_level += 0.1
        else:
            self.stress_level = max(0, self.stress_level - 0.05)
            
        return actual_qty

    def decide_compliance(self, expected_penalty: float, black_market_premium: float) -> str:
        """
        Decision rule for compliance or evasion (e.g., black market).
        Factors: Risk tolerance, peer influence, and economic incentive.
        """
        # Simplified expected utility of evasion vs compliance
        evasion_benefit = black_market_premium * (1.0 - self.risk_tolerance)
        if evasion_benefit > expected_penalty * self.compliance_probability:
            if random.random() > self.compliance_probability:
                self.last_decision = "evade"
                return "evade"
        
        self.last_decision = "comply"
        return "comply"

    def apply_social_influence(self, neighbors_behavior: List[str]):
        """
        Peer influence: Agents partially imitate neighbors.
        If many neighbors evade, compliance probability drops.
        """
        if not neighbors_behavior:
            return
            
        evasion_rate = neighbors_behavior.count("evade") / len(neighbors_behavior)
        
        # Drift compliance probability based on social pressure
        adjustment = (evasion_rate - 0.5) * self.social_influence_weight
        self.compliance_probability = max(0.1, min(1.0, self.compliance_probability - adjustment))

    def relocate(self, local_utility: float, global_avg_utility: float) -> bool:
        """Decision to move based on mobility and local vs global conditions."""
        if self.mobility < 0.2: return False # Stuck
        
        relocation_incentive = global_avg_utility - local_utility
        if relocation_incentive > (1.0 - self.mobility):
            if random.random() < self.mobility:
                return True
        return False

    def update_income(self, new_income: float):
        self.income = new_income
        self.wealth += (new_income - self.base_income)
        self.base_income = new_income

    def __repr__(self):
        return f"Agent(id={self.id}, income={self.income:.1f}, stress={self.stress_level:.2f})"

def generate_population(n: int, seed: int = 42) -> List[Agent]:
    """Generates a heterogeneous population across income deciles."""
    random.seed(seed)
    np.random.seed(seed)
    
    population = []
    for i in range(n):
        # Pareto-like income distribution
        income = np.random.lognormal(mean=7.0, sigma=0.8) 
        consumption_need = 500 + (income * 0.2) # Basic need + discretionary
        mobility = random.uniform(0, 1)
        risk_tolerance = random.uniform(0, 1)
        
        agent = Agent(
            agent_id=i,
            income=income,
            consumption_need=consumption_need,
            mobility=mobility,
            risk_tolerance=risk_tolerance
        )
        population.append(agent)
    return population
