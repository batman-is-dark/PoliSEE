import numpy as np
from typing import List, Dict, Any, Optional
from .agents import Agent, generate_population
from .environment import Environment
from .policy_definitions import Policy, PolicyType

class SimulationEngine:
    """
    Orchestrates the time evolution of the system.
    Applies policies, updates agents, and records history.
    """
    def __init__(self, population_size: int = 100, seed: int = 42):
        self.seed = seed
        self.agents = generate_population(population_size, seed=seed)
        self.agents_dict = {a.id: a for a in self.agents}
        self.env = Environment(size=max(1, population_size // 10))
        self.env.place_agents(self.agents)
        
        self.active_policies: List[Policy] = []
        self.history: List[Dict[str, Any]] = []
        self.current_step = 0

    def add_policy(self, policy: Policy):
        self.active_policies.append(policy)

    def step(self):
        """Perform one month of simulation."""
        self.current_step += 1
        
        # 1. Update market dynamics based on last step
        self.env.update_market_dynamics(self.agents)
        
        # 2. Apply policies and gather agent actions
        total_evaded = 0
        total_stress = 0.0
        
        for agent in self.agents:
            # Apply Policy: Intended Mechanism (e.g., Subsidies)
            for policy in self.active_policies:
                if policy.type == PolicyType.HOUSING_RENT_SUBSIDY:
                    new_income = policy.apply_intended_effect(agent.income)
                    agent.update_income(new_income)
            
            # Agent Decisions: Consumption & Compliance
            price = self.env.get_local_price(agent.id)
            availability = self.env.get_local_availability(agent.id)
            
            # Policy Distortion: Adjust price or supply constraint based on policy
            for policy in self.active_policies:
                if policy.type == PolicyType.FOOD_PRICE_CEILING:
                    # If ceiling is active, it might limit supply or force black market
                    pass # TODO: Implement deeper integration
            
            agent.decide_consumption(price, availability)
            
            # Social influence check
            neighbors_behavior = self.env.get_neighbors_behavior(agent.id, self.agents_dict)
            agent.apply_social_influence(neighbors_behavior)
            
            # Compliance check
            decision = agent.decide_compliance(expected_penalty=50.0, black_market_premium=price * 0.5)
            if decision == "evade":
                total_evaded += 1
            
            total_stress += agent.stress_level

        # 3. Collect Macro Data
        macro = self.env.get_macro_indicators()
        incomes = [a.income for a in self.agents]
        gini = self.calculate_gini(incomes)
        
        step_data = {
            "step": self.current_step,
            "avg_price": macro["avg_price"],
            "total_demand": macro["total_demand"],
            "gini": gini,
            "compliance_rate": 1.0 - (total_evaded / len(self.agents)),
            "avg_stress": total_stress / len(self.agents)
        }
        self.history.append(step_data)
        return step_data

    def run(self, steps: int = 24):
        results = []
        for _ in range(steps):
            results.append(self.step())
        return results

    @staticmethod
    def calculate_gini(incomes: List[float]) -> float:
        """Standard Gini coefficient for inequality."""
        incomes = sorted(incomes)
        n = len(incomes)
        index = np.arange(1, n + 1)
        return (np.sum((2 * index - n  - 1) * incomes)) / (n * np.sum(incomes)) if np.sum(incomes) > 0 else 0
