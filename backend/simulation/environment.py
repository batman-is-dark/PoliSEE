import random
import numpy as np
from typing import List, Dict, Any, Optional
from .agents import Agent

class Environment:
    """
    Manages the spatial/network context for agents.
    Enforces local constraints like supply and coordinates agent-agent interactions.
    """
    def __init__(self, size: int = 10, connectivity: float = 0.2):
        self.size = size # E.g., a 10x10 grid of neighborhoods
        # Start with tighter supply to make dynamics more visible
        self.neighborhoods = {i: {"supply": 50.0, "demand": 0.0, "price": 10.0} for i in range(size)}
        self.agent_locations: Dict[int, int] = {} # agent_id -> neighborhood_id
        
        # Simple adjacency list for social influence
        self.network: Dict[int, List[int]] = {} 

    def place_agents(self, agents: List[Agent]):
        """Distributes agents across neighborhoods."""
        for agent in agents:
            loc = random.randint(0, self.size - 1)
            self.agent_locations[agent.id] = loc
            
        # Build a basic social network (small-world or random)
        agent_ids = [a.id for a in agents]
        for aid in agent_ids:
            # Each agent knows 2-5 others
            num_friends = random.randint(2, 5)
            self.network[aid] = random.sample(agent_ids, num_friends)

    def get_neighbors_behavior(self, agent_id: int, agents_dict: Dict[int, Agent]) -> List[str]:
        """Returns the last decision (comply/evade) of an agent's social circle."""
        friend_ids = self.network.get(agent_id, [])
        return [agents_dict[fid].last_decision for fid in friend_ids if fid in agents_dict]

    def update_market_dynamics(self, agents: List[Agent]):
        """
        Updates neighborhood-level prices based on local supply and demand.
        This is where small changes can amplify into macro effects.
        """
        # Use realized consumption (last_consumption) to compute actual demand
        local_demands = {i: 0.0 for i in self.neighborhoods}
        for agent in agents:
            loc = self.agent_locations[agent.id]
            # Use the agent's last actual consumption rather than a static need
            local_demands[loc] += getattr(agent, "last_consumption", agent.consumption_need)
            
        for loc, data in self.neighborhoods.items():
            supply = data["supply"]
            demand = local_demands[loc]
            
            # Price adjustment rule (Law of Supply and Demand)
            if supply > 0:
                price_pressure = demand / supply
                # Nonlinear price response
                data["price"] = data["price"] * (0.9 + 0.2 * price_pressure)
                # Keep price within reasonable bounds (expanded ceiling to allow larger dynamics)
                data["price"] = max(1.0, min(1000.0, data["price"]))
                data["demand"] = demand
            # Simulate supply depletion/adjustment: supply drops a bit when demand is high
            # Increase sensitivity so users see feedback more clearly
            depletion = demand * 0.05
            data["supply"] = max(0.1, data["supply"] - depletion)

    def get_local_price(self, agent_id: int) -> float:
        loc = self.agent_locations[agent_id]
        return self.neighborhoods[loc]["price"]

    def get_local_availability(self, agent_id: int) -> float:
        # Availability should reflect local supply
        loc = self.agent_locations.get(agent_id, 0)
        return self.neighborhoods[loc]["supply"]

    def get_macro_indicators(self) -> Dict[str, float]:
        """Aggregates state into macro variables."""
        avg_price = np.mean([n["price"] for n in self.neighborhoods.values()])
        total_demand = sum([n["demand"] for n in self.neighborhoods.values()])
        return {
            "avg_price": float(avg_price),
            "total_demand": float(total_demand)
        }
