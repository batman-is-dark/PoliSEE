from dataclasses import dataclass
from typing import Dict, Any, Optional
import enum

class PolicyType(enum.Enum):
    HOUSING_RENT_SUBSIDY = "housing_rent_subsidy"
    LUXURY_ASSET_TAX = "luxury_asset_tax"
    FOOD_PRICE_CEILING = "food_price_ceiling"

@dataclass
class PolicyParameter:
    name: str
    value: float
    description: str
    min_val: float
    max_val: float

class Policy:
    """
    Base class for policy interventions.
    Separates intended mechanisms from incentive distortions.
    """
    def __init__(self, type: PolicyType, parameters: Dict[str, PolicyParameter]):
        self.type = type
        self.parameters = parameters

    def get_param(self, name: str) -> float:
        return self.parameters[name].value

    def apply_intended_effect(self, state: Any) -> Any:
        """What policymakers WANT to happen."""
        raise NotImplementedError

    def apply_distortion_mechanism(self, state: Any) -> Any:
        """How agents respond strategically (The 'Side Effect')."""
        raise NotImplementedError

class HousingRentSubsidy(Policy):
    """
    Policy: Provide cash subsidies to low-income renters.
    Intuition: Increase affordability for the poor.
    Distortion: Landlords may raise rents to capture the subsidy (Price Spiral).
    """
    def __init__(self, subsidy_amount: float = 200, eligibility_threshold: float = 1000):
        params = {
            "subsidy_amount": PolicyParameter("Subsidy Amount", subsidy_amount, "Monthly cash to eligible renters", 0, 1000),
            "eligibility_threshold": PolicyParameter("Eligibility Threshold", eligibility_threshold, "Maximum income to qualify", 0, 5000)
        }
        super().__init__(PolicyType.HOUSING_RENT_SUBSIDY, params)

    def apply_intended_effect(self, agent_income: float) -> float:
        """Increases disposable income for eligible agents."""
        if agent_income < self.get_param("eligibility_threshold"):
            return agent_income + self.get_param("subsidy_amount")
        return agent_income

    def apply_distortion_mechanism(self, market_demand: float, housing_supply: float) -> float:
        """
        Models rent inflation. If demand increases without supply growth, 
        prices rise, potentially offsetting the subsidy.
        """
        # Simplistic scarcity-driven price pressure
        if housing_supply == 0: return 1.0
        pressure = (market_demand / housing_supply)
        return max(0, (pressure - 1.0) * 0.5) # Returns a price increase factor

class LuxuryAssetTax(Policy):
    """
    Policy: Apply a high tax rate on assets valued above a certain threshold.
    Intuition: Extract revenue from idle wealth to fund public utility.
    Distortion: Capital Flight. Wealthy agents may liquidate assets or relocate 
    capital if the tax rate exceeds their perceived 'exit threshold'.
    """
    def __init__(self, tax_rate: float = 0.05, wealth_threshold: float = 2000):
        params = {
            "tax_rate": PolicyParameter("Tax Rate", tax_rate, "Annual tax on luxury assets", 0, 0.2),
            "wealth_threshold": PolicyParameter("Wealth Threshold", wealth_threshold, "Minimum asset value to trigger tax", 500, 10000)
        }
        super().__init__(PolicyType.LUXURY_ASSET_TAX, params)

    def calculate_wealth_tax(self, asset_value: float) -> float:
        if asset_value > self.get_param("wealth_threshold"):
            return (asset_value - self.get_param("wealth_threshold")) * self.get_param("tax_rate")
        return 0.0

    def get_capital_flight_probability(self, asset_value: float) -> float:
        """Models the risk of agents moving capital out of the system."""
        if asset_value <= self.get_param("wealth_threshold"): return 0.0
        
        # RISK AGGRESSION: Make it much more sensitive to tax rates
        # Exposure is now relative to the threshold gap
        exposure = (asset_value - self.get_param("wealth_threshold")) / 1000.0 # Normalized per $1000 over threshold
        risk = exposure * self.get_param("tax_rate") * 20.0 # Doubled sensitivity
        return min(0.9, risk)

class FoodPriceCeiling(Policy):
    """
    Policy: Cap the price of essential food items.
    Intuition: Ensure basic nutrition is affordable during inflation.
    Distortion: Suppliers may shift to black markets or reduce supply, 
    leading to shortages and long queues.
    """
    def __init__(self, price_cap: float = 5.0, supply_sensitivity: float = 1.5):
        params = {
            "price_cap": PolicyParameter("Price Cap", price_cap, "Maximum allowed price for food unit", 1, 20),
            "supply_sensitivity": PolicyParameter("Supply Sensitivity", supply_sensitivity, "How quickly supply retreats from price caps", 0, 5)
        }
        super().__init__(PolicyType.FOOD_PRICE_CEILING, params)

    def supply_contraction(self, market_price: float) -> float:
        """Models supply withdrawal when cap is below market equilibrium."""
        cap = self.get_param("price_cap")
        if cap < market_price:
            # Supply drops exponentially as gap widens
            gap = (market_price - cap) / market_price
            return max(0.1, 1.0 - (gap * self.get_param("supply_sensitivity")))
        return 1.0
