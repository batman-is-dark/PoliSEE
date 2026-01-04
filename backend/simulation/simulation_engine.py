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
        
        # 1. Apply policies and gather agent actions (agents consume based on current prices)
        total_evaded = 0
        total_stress = 0.0
        total_tax_revenue = 0.0
        
        # Dynamic enforcement: penalty increases if many policies are active (more scrutiny)
        # or if evasion was high in the previous step
        base_penalty = 2.0 + (len(self.active_policies) * 1.5)
        if self.history:
            prev_evasion = 1.0 - self.history[-1]["compliance_rate"]
            base_penalty += prev_evasion * 10.0 # Increased enforcement in response to evasion
        
        # Pre-calculate policy effects that apply to all agents
        fuel_tax_policy = next((p for p in self.active_policies if p.type == PolicyType.FUEL_TAX_REBATE), None)
        luxury_tax_policy = next((p for p in self.active_policies if p.type == PolicyType.LUXURY_ASSET_TAX), None)

        for agent in self.agents:
            # Replenish wealth for the new month
            agent.update_income(agent.income)
            
            # Apply Policy: Intended Mechanism (e.g., Subsidies)
            for policy in self.active_policies:
                if policy.type == PolicyType.HOUSING_RENT_SUBSIDY:
                    new_income = policy.apply_intended_effect(agent.income)
                    # This adds the subsidy to the already replenished wealth
                    agent.wealth += (new_income - agent.income)
                    agent.income = new_income
            
            # Agent Decisions: Consumption & Compliance
            price = self.env.get_local_price(agent.id)
            
            # Apply Fuel Tax distortion to price
            if fuel_tax_policy:
                price = fuel_tax_policy.apply_price_distortion(price)

            availability = self.env.get_local_availability(agent.id)
            
            actual_qty = agent.decide_consumption(price, availability)
            
            # Collect Fuel Tax revenue
            if fuel_tax_policy:
                tax_paid = actual_qty * price * (fuel_tax_policy.get_param("tax_rate") / (1 + fuel_tax_policy.get_param("tax_rate")))
                total_tax_revenue += tax_paid

            # Apply Luxury Tax
            if luxury_tax_policy:
                tax = luxury_tax_policy.calculate_wealth_tax(agent.wealth)
                agent.wealth -= tax
                total_tax_revenue += tax
                
                # Capital Flight check
                if np.random.random() < luxury_tax_policy.get_capital_flight_probability(agent.wealth):
                    # Agent "hides" or moves 50% of wealth out of the system
                    agent.wealth *= 0.5
                    agent.stress_level = min(1.0, agent.stress_level + 0.2)

            # Social influence check
            neighbors_behavior = self.env.get_neighbors_behavior(agent.id, self.agents_dict)
            agent.apply_social_influence(neighbors_behavior)
            
            # Compliance check
            bm_premium = price * 0.6 
            decision = agent.decide_compliance(expected_penalty=base_penalty, black_market_premium=bm_premium)
            if decision == "evade":
                total_evaded += 1
            
            total_stress += agent.stress_level

        # Redistribute Fuel Tax Rebates
        if fuel_tax_policy and total_tax_revenue > 0:
            for agent in self.agents:
                rebate = fuel_tax_policy.apply_intended_effect(agent.income, total_tax_revenue, len(self.agents))
                agent.wealth += (rebate - agent.income)
                # Note: we don't update agent.income permanently here as it's a one-time rebate per step

        # 2. Update market dynamics based on realized consumption this step
        self.env.update_market_dynamics(self.agents)

        # Apply policy distortion mechanisms that affect price or supply
        # e.g., landlords capture subsidy (rent inflation) or price caps cause supply contraction
        for policy in self.active_policies:
            # Housing: landlords may increase rents in response to demand/supply imbalance
            if policy.type == PolicyType.HOUSING_RENT_SUBSIDY:
                for loc, data in self.env.neighborhoods.items():
                    demand = data.get("demand", 0.0)
                    supply = data.get("supply", 1.0)
                    factor = policy.apply_distortion_mechanism(demand, supply)
                    # Apply multiplicative effect
                    data["price"] = data["price"] * (1.0 + factor)

            # Food price ceiling: suppliers may withdraw, reducing supply
            if policy.type == PolicyType.FOOD_PRICE_CEILING:
                for loc, data in self.env.neighborhoods.items():
                    contraction = policy.supply_contraction(data["price"])
                    data["supply"] = max(0.1, data["supply"] * contraction)

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
