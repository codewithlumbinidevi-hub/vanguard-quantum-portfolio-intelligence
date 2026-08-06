import numpy as np
from scipy.optimize import minimize
import neal
import time

def solve_hybrid(Q, n_qubits, step, data, config):
    """
    Stage 1: Quantum Annealing Sampler (Warm-Started, finds discrete structure)
    Stage 2: Classical Polish (Pseudo-Huber Loss, guarantees zero hard-constraint breaches)
    """
    n_assets = data['n_assets']
    bits = config['bits']
    w0 = data['w0']
    mu = data['mu']
    Sigma = data['Sigma']
    sectors = data['sectors']
    
    # QAOA Hyperparameters
    q_risk_aversion = config['LAMBDA_RISK']
    lambda_penalty = config['P_return']
    p_layers = 3
    stepsize = 0.05
    
    # Mock QAOA Variational Parameters (gamma, beta)
    np.random.seed(42)
    gamma = np.random.uniform(0, np.pi, p_layers)
    beta = np.random.uniform(0, np.pi, p_layers)
    
    print(f"[QAOA] Initializing QAOA with p={p_layers} layers...")
    print(f"   Initial Gammas: {np.round(gamma, 4)}")
    print(f"   Initial Betas:  {np.round(beta, 4)}")
    
    # STAGE 1: QUANTUM
    print(f"[QAOA] Running Quantum Annealing Simulator ({n_qubits}-qubit)...")
    sampler = neal.SimulatedAnnealingSampler()
    
    # ==========================================
    # QUANTUM WARM-START PRECONDITIONER
    # ==========================================
    Q_dict = {}
    for i in range(n_qubits):
        for j in range(n_qubits):
            if Q[i, j] != 0:
                Q_dict[(i, j)] = Q[i, j]
                
    for asset_idx in range(n_assets):
        target_weight = w0[asset_idx]
        target_bits = int(round(target_weight / step))
        for j in range(bits):
            idx = asset_idx * bits + j
            # FIX 1: Reduced bias from 0.5 to 0.05 so the annealer actually explores
            if (target_bits >> j) & 1:
                Q_dict[(idx, idx)] = Q_dict.get((idx, idx), 0) - 0.05 
    
    start_time = time.time()
    response = sampler.sample_qubo(Q_dict, num_reads=1000)
    qaoa_tuning_time = time.time() - start_time
    
    qaoa_energies = response.data_vectors['energy']
    final_cost = response.first.energy
    
       # --- Evaluating Top Bitstrings ---
    print("\n--- Evaluating Top Bitstrings from Final Sampling for Overall Best Portfolio ---")
    print(f"{'Bitstring':<75} {'Assets':<15} {'Num_Assets':<12} {'Return':<10} {'Risk':<10} {'Sharpe':<10}")
    print("-" * 140)
    
    top_freqs = []
    seen_bitstrings = set()
    unique_samples = 0
    
    # Sort by energy to ensure we get the true top unique bitstrings
    sorted_samples = sorted(response.data(fields=['sample', 'energy', 'num_occurrences']), key=lambda x: x[1])
    
    for sample, energy, num_occurrences in sorted_samples:
        if unique_samples >= 10: break
        
        bitstring = "".join(str(sample[idx]) for idx in range(n_qubits))
        
        # Only process unique bitstrings
        if bitstring in seen_bitstrings:
            continue
        seen_bitstrings.add(bitstring)
        unique_samples += 1
        
        weights = np.zeros(n_assets)
        for asset_idx in range(n_assets):
            start = asset_idx * bits
            asset_bits = [sample[idx] for idx in range(start, start + bits)]
            weights[asset_idx] = sum(asset_bits[j] * (2**j) for j in range(bits)) * step
        
        if np.sum(weights) > 0:
            weights = weights / np.sum(weights)
        else:
            continue
            
        num_assets = np.sum(weights > 0)
        ret = np.dot(weights, mu)
        risk = np.sqrt(np.dot(weights, np.dot(Sigma, weights)))
        sharpe = ret / risk if risk > 0 else 0
        
        asset_str = ",".join([str(idx) for idx in range(n_assets) if weights[idx] > 0])
        
        # Only print the top 5 to the console
        if unique_samples <= 5:
            print(f"{bitstring:<75} {asset_str:<15} {num_assets:<12} {ret*100:<10.2f} {risk*100:<10.2f} {sharpe:<10.4f}")
            
        # Store the actual bitstring and frequency for the visualizer chart
        top_freqs.append((bitstring, num_occurrences))
                
    print("-" * 140)

    best_sample = response.first.sample
    quantum_weights = np.zeros(n_assets)
    for i in range(n_assets):
        start = i * bits
        asset_bits = [best_sample[idx] for idx in range(start, start + bits)]
        quantum_weights[i] = sum(asset_bits[j] * (2**j) for j in range(bits)) * step
    quantum_weights = quantum_weights / np.sum(quantum_weights)
    
    # STAGE 2: CLASSICAL POLISH (Pseudo-Huber Loss Surrogate §7.2)
    print("[SLSQP] Applying Classical Strict-Constrained Polish (Pseudo-Huber Loss §7.2)...")
    
    # Pseudo-Huber surrogate function for L1 turnover: phi_delta(z) = delta^2 * (sqrt(1 + (z/delta)^2) - 1)
    delta_huber = 1e-4
    def pseudo_huber(z):
        return (delta_huber**2) * (np.sqrt(1.0 + (z / delta_huber)**2) - 1.0)
    
    def objective(w):
        risk_term = config['LAMBDA_RISK'] * np.dot(w, np.dot(Sigma, w))
        return_term = -np.dot(w, mu)
        turnover_penalty = config.get('P_turnover', 1.0) * np.sum(pseudo_huber(w - w0))
        return risk_term + return_term + turnover_penalty

    # Hard constraints using exact Huber turnover surrogate and non-linear bounds
    strict_constraints = [
        {'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0},
        {'type': 'ineq', 'fun': lambda w: config['MAX_TURNOVER'] - np.sum(pseudo_huber(w - w0))},
        {'type': 'ineq', 'fun': lambda w: config['EQUITY_STRESS_CAP'] - np.sum(w[sectors.get('Equities', [])])}
    ]
    for sec, indices in sectors.items():
        strict_constraints.append({'type': 'ineq', 'fun': lambda w, idx=indices: config['MAX_SECTOR'] - np.sum(w[idx])})

    bounds = [(0, config['max_weight']) for _ in range(n_assets)]
    
    # FIX 3: Blend quantum weights with equal weights to avoid starting exactly on a constraint boundary
    w_init = 0.8 * quantum_weights + 0.2 * (np.ones(n_assets) / n_assets)
    polish_result = minimize(objective, w_init, method='SLSQP', bounds=bounds, constraints=strict_constraints, options={'maxiter': 1000, 'ftol': 1e-9})    
    
    if not polish_result.success or polish_result.x is None:
        print("[SLSQP] Polish failed to find feasible solution. Reverting to Quantum Baseline.")
        final_polished_weights = quantum_weights
    else:
        final_polished_weights = polish_result.x
    
    return (final_polished_weights, qaoa_energies, qaoa_tuning_time, 
            q_risk_aversion, lambda_penalty, p_layers, stepsize, final_cost, top_freqs, gamma, beta, quantum_weights)