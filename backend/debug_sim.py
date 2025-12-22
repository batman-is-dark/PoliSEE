from simulation.simulation_engine import SimulationEngine
import json

def run_debug():
    e = SimulationEngine(population_size=50, seed=1)
    e.step()
    print('last history step:')
    print(json.dumps(e.history[-1], indent=2))
    print('sum_last_consumption =', sum(getattr(a, 'last_consumption', 0) for a in e.agents))
    print('neighborhood_demands =')
    for i, v in e.env.neighborhoods.items():
        print(i, v)

if __name__ == '__main__':
    run_debug()
