Dataset generator

This script generates simulated runs using the project's `SimulationEngine` and writes two outputs to the `backend` folder:

- `dataset_simulated.json`: full-run records including neighborhood snapshots
- `dataset_simulated_flat.csv`: flattened per-step metrics (one row per step)

Usage (from repo root):

```bash
cd backend
python generate_dataset.py
```

Adjust `num_runs` and `steps` by editing the `if __name__ == '__main__'` block.
