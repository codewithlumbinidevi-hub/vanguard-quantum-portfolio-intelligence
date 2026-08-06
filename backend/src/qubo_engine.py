import numpy as np
from pyqubo import Array, Binary, Placeholder

def build_qubo(data, config):
    """
    QUBO Builder for the MinVola variant (Stopfer et al., 2026, §4).
    Objective : Minimize σ²(w)
    Subject to: μᵀw ≥ ε,  Σwᵢ = 1,  0 ≤ wᵢ ≤ uᵢ
    """
    mu          = data['mu']
    Sigma       = data['Sigma']
    w0          = data['w0']
    sectors     = data['sectors']
    n_assets    = data['n_assets']
    bits        = config['bits']
    max_weight  = config['max_weight']

    step   = max_weight / (2**bits - 1)
    n_vars = n_assets * bits
    Q      = np.zeros((n_vars, n_vars))

    LAMBDA_RISK   = config['LAMBDA_RISK']
    
    # Section 5.3 Dynamic Spectral Penalty Scaling (P_bud > lambda_max, P_ret > lambda_max)
    eigvals = np.linalg.eigvalsh(Sigma)
    lambda_max = float(np.max(eigvals)) if len(eigvals) > 0 else 1.0
    spectral_floor = max(10.0, 2.0 * lambda_max)
    
    P_return      = max(config.get('P_return', 50.0), spectral_floor)
    P_budget      = max(config.get('P_budget', 100.0), spectral_floor)
    P_sector      = max(config.get('P_sector', 20.0), spectral_floor * 0.5)
    P_turnover    = config['P_turnover']
    MIN_RETURN    = config['MIN_RETURN']
    MAX_SECTOR    = config['MAX_SECTOR']

    bit_values = np.array([2**j for j in range(bits)])

    # ---------- 1. MINIMIZE VOLATILITY ----------
    for i in range(n_assets):
        for k in range(n_assets):
            for j in range(bits):
                for l in range(bits):
                    idx_ij = i * bits + j
                    idx_kl = k * bits + l
                    coeff  = LAMBDA_RISK * (step**2) * bit_values[j] * bit_values[l] * Sigma[i, k]
                    if idx_ij == idx_kl:
                        Q[idx_ij, idx_kl] += coeff
                    else:
                        Q[idx_ij, idx_kl] += coeff / 2
                        Q[idx_kl, idx_ij] += coeff / 2

    # ---------- 2. MINIMUM RETURN PENALTY  (μᵀw − ε)² ----------
    for i in range(n_assets):
        for k in range(n_assets):
            for j in range(bits):
                for l in range(bits):
                    idx_ij = i * bits + j
                    idx_kl = k * bits + l
                    coeff  = P_return * (step**2) * bit_values[j] * bit_values[l] * mu[i] * mu[k]
                    if idx_ij == idx_kl:
                        Q[idx_ij, idx_kl] += coeff
                    else:
                        Q[idx_ij, idx_kl] += coeff / 2
                        Q[idx_kl, idx_ij] += coeff / 2
    for i in range(n_assets):
        for j in range(bits):
            idx = i * bits + j
            Q[idx, idx] -= 2 * P_return * MIN_RETURN * step * mu[i] * bit_values[j]

    # ---------- 3. BUDGET PENALTY (Σwᵢ − 1)² ----------
    for i in range(n_assets):
        for k in range(n_assets):
            for j in range(bits):
                for l in range(bits):
                    idx_ij = i * bits + j
                    idx_kl = k * bits + l
                    coeff  = P_budget * (step**2) * bit_values[j] * bit_values[l]
                    if idx_ij == idx_kl:
                        Q[idx_ij, idx_kl] += coeff
                    else:
                        Q[idx_ij, idx_kl] += coeff / 2
                        Q[idx_kl, idx_ij] += coeff / 2
    for i in range(n_assets):
        for j in range(bits):
            idx = i * bits + j
            Q[idx, idx] -= 2 * P_budget * step * bit_values[j]

    # ---------- 4. TURNOVER PENALTY Σ_i (wᵢ − wᵢ⁰)² ----------
    for i in range(n_assets):
        for j in range(bits):
            for l in range(bits):
                idx_ij = i * bits + j
                idx_il = i * bits + l
                coeff  = P_turnover * (step**2) * bit_values[j] * bit_values[l]
                if idx_ij == idx_il:
                    Q[idx_ij, idx_il] += coeff
                else:
                    Q[idx_ij, idx_il] += coeff / 2
                    Q[idx_il, idx_ij] += coeff / 2
        for j in range(bits):
            idx = i * bits + j
            Q[idx, idx] -= 2 * P_turnover * w0[i] * step * bit_values[j]

    # ---------- 5. SECTOR PENALTIES ----------
    for sec, indices in sectors.items():
        for i in indices:
            for k in indices:
                for j in range(bits):
                    for l in range(bits):
                        idx_ij = i * bits + j
                        idx_kl = k * bits + l
                        coeff  = P_sector * (step**2) * bit_values[j] * bit_values[l]
                        if idx_ij == idx_kl:
                            Q[idx_ij, idx_kl] += coeff
                        else:
                            Q[idx_ij, idx_kl] += coeff / 2
                            Q[idx_kl, idx_ij] += coeff / 2
        for i in indices:
            for j in range(bits):
                idx = i * bits + j
                Q[idx, idx] -= 2 * P_sector * MAX_SECTOR * step * bit_values[j]

    # ==========================================
    # 6. EQUITY STRESS CAP PENALTY (Added to QUBO)
    # ==========================================
    P_stress = config.get('P_stress', 50.0)
    eq_indices = data['sectors'].get('Equities', [])
    for i in eq_indices:
        for k in eq_indices:
            for j in range(bits):
                for l in range(bits):
                    idx_ij = i * bits + j
                    idx_kl = k * bits + l
                    coeff = P_stress * (step**2) * bit_values[j] * bit_values[l]
                    if idx_ij == idx_kl:
                        Q[idx_ij, idx_kl] += coeff
                    else:
                        Q[idx_ij, idx_kl] += coeff / 2
                        Q[idx_kl, idx_ij] += coeff / 2
        
        for j in range(bits):
            idx = i * bits + j
            Q[idx, idx] -= 2 * P_stress * config['EQUITY_STRESS_CAP'] * step * bit_values[j]

    # ==========================================
    # 7. CARDINALITY CONSTRAINT PENALTY (Added to QUBO)
    # ==========================================
    P_card = config.get('P_card', 2.0)
    max_assets = config.get('MAX_ASSETS', 12)
    for i in range(n_assets):
        for j in range(bits):
            idx = i * bits + j
            if j == bits - 1:
                Q[idx, idx] += P_card * bit_values[j]

    return Q, n_vars, step