import argparse
import json
import random
import csv
from pathlib import Path
from typing import Tuple, List, Dict, Any

from simulation.simulation_engine import SimulationEngine
from simulation.policy_definitions import HousingRentSubsidy, LuxuryAssetTax, FoodPriceCeiling, FuelTaxWithRebate


OUT_DIR = Path(__file__).parent
JSON_OUT = OUT_DIR / "dataset_simulated.json"
CSV_OUT = OUT_DIR / "dataset_simulated_flat.csv"
LABELED_CSV_OUT = OUT_DIR / "dataset_simulated_flat_labeled.csv"


def detect_labels(history: List[Dict[str, Any]], neighborhoods: Dict[str, Any]) -> Dict[str, int]:
    # Price spike: any month-over-month jump > 20%
    price_vals = [s.get('avg_price', 0) for s in history]
    price_spike = 0
    for i in range(1, len(price_vals)):
        prev = price_vals[i - 1] or 1e-6
        if price_vals[i] / prev - 1.0 > 0.20:
            price_spike = 1
            break

    # Supply shortage: any neighborhood supply below 0.2 at final snapshot
    supply_shortage = 0
    try:
        for loc, data in neighborhoods.items():
            if data.get('supply', 1.0) < 0.2:
                supply_shortage = 1
                break
    except Exception:
        supply_shortage = 0

    # Compliance collapse: any step with compliance_rate < 0.5
    comp_collapse = 0
    for s in history:
        if s.get('compliance_rate', 1.0) < 0.5:
            comp_collapse = 1
            break

    return {'price_spike': price_spike, 'supply_shortage': supply_shortage, 'compliance_collapse': comp_collapse}


def generate_sample(num_runs: int = 100, steps: int = 24) -> Tuple[Path, Path, Path]:
    results: List[Dict[str, Any]] = []
    flat_rows: List[Dict[str, Any]] = []
    labeled_rows: List[Dict[str, Any]] = []

    for s in range(num_runs):
        seed = random.randint(0, 2**31 - 1)
        pop = random.randint(50, 300)
        engine = SimulationEngine(population_size=pop, seed=seed)

        # Randomly pick a policy or no policy
        policy_choice = random.choice([None, 'housing', 'luxury', 'food', 'fuel'])
        policy_meta = None
        if policy_choice == 'housing':
            subsidy_amt = random.uniform(50, 500)
            elig = random.uniform(500, 2000)
            policy = HousingRentSubsidy(subsidy_amount=subsidy_amt, eligibility_threshold=elig)
            policy_meta = {'type': 'housing_rent_subsidy', 'params': {'subsidy_amount': policy.get_param('subsidy_amount'), 'eligibility_threshold': policy.get_param('eligibility_threshold')}}
            engine.add_policy(policy)
        elif policy_choice == 'luxury':
            policy = LuxuryAssetTax(tax_rate=random.uniform(0.0, 0.2), wealth_threshold=random.uniform(1000, 5000))
            policy_meta = {'type': 'luxury_asset_tax', 'params': {'tax_rate': policy.get_param('tax_rate'), 'wealth_threshold': policy.get_param('wealth_threshold')}}
            engine.add_policy(policy)
        elif policy_choice == 'food':
            cap = random.uniform(1.0, 10.0)
            policy = FoodPriceCeiling(price_cap=cap)
            policy_meta = {'type': 'food_price_ceiling', 'params': {'price_cap': policy.get_param('price_cap')}}
            engine.add_policy(policy)
        elif policy_choice == 'fuel':
            tax = random.uniform(0.0, 0.5)
            rebate = random.uniform(0.5, 1.0)
            policy = FuelTaxWithRebate(tax_rate=tax, rebate_percent=rebate)
            policy_meta = {'type': 'fuel_tax_rebate', 'params': {'tax_rate': policy.get_param('tax_rate'), 'rebate_percent': policy.get_param('rebate_percent')}}
            engine.add_policy(policy)

        history = engine.run(steps)
        neighborhoods = engine.env.neighborhoods

        labels = detect_labels(history, neighborhoods)

        run_rec = {'seed': seed, 'population_size': pop, 'policy': policy_meta, 'history': history, 'neighborhoods': neighborhoods, 'labels': labels}
        results.append(run_rec)

        # Flatten per-step metrics for CSV
        for step in history:
            row = {
                'seed': seed,
                'population_size': pop,
                'policy_type': policy_meta['type'] if policy_meta else 'none',
                'step': step.get('step'),
                'avg_price': step.get('avg_price'),
                'total_demand': step.get('total_demand'),
                'gini': step.get('gini'),
                'compliance_rate': step.get('compliance_rate'),
                'avg_stress': step.get('avg_stress')
            }
            flat_rows.append(row)

        # Add a single labeled row per run (summary)
        labeled_rows.append({
            'seed': seed,
            'population_size': pop,
            'policy_type': policy_meta['type'] if policy_meta else 'none',
            'price_spike': labels['price_spike'],
            'supply_shortage': labels['supply_shortage'],
            'compliance_collapse': labels['compliance_collapse']
        })

    # Write JSON
    with open(JSON_OUT, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    # Write CSV
    if flat_rows:
        with open(CSV_OUT, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=list(flat_rows[0].keys()))
            writer.writeheader()
            for r in flat_rows:
                writer.writerow(r)

    # Write labeled summary CSV (one row per run)
    if labeled_rows:
        keys = list(labeled_rows[0].keys())
        with open(LABELED_CSV_OUT, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            for r in labeled_rows:
                writer.writerow(r)

    return JSON_OUT, CSV_OUT, LABELED_CSV_OUT


def parse_args():
    p = argparse.ArgumentParser(description='Generate simulated dataset from poliSEE simulator')
    p.add_argument('--runs', type=int, default=100, help='Number of simulation runs')
    p.add_argument('--steps', type=int, default=24, help='Number of steps per run')
    return p.parse_args()


if __name__ == '__main__':
    args = parse_args()
    print(f'Generating sample dataset: runs={args.runs}, steps={args.steps} ...')
    json_path, csv_path, labeled_csv = generate_sample(num_runs=args.runs, steps=args.steps)
    print('Wrote JSON:', json_path)
    print('Wrote CSV:', csv_path)
    print('Wrote Labeled summary CSV:', labeled_csv)
