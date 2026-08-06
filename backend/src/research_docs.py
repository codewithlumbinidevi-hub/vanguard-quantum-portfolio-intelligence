import numpy as np

def print_mathematical_formulation():
    print("\n" + "="*75)
    print("📊 1. MATHEMATICAL FORMULATION")
    print("="*75)
    print("""
Decision Variables:
  x_{i,j} ∈ {0, 1}  (Binary variable for asset i, bit j)
  w_i = Δ * Σ (2^j * x_{i,j})  (Discretized weight, Δ = step size)

Objective Function (Minimize Volatility & Cost, Maximize Return):
  min  O(w) = λ * (w^T Σ w) - μ^T w + γ * Σ (w_i - w_{0,i})^2

Subject to Constraints:
  1. Budget:      Σ w_i = 1
  2. Position:    0 ≤ w_i ≤ 0.25
  3. Sector:      Σ_{i ∈ S_k} w_i ≤ 0.40
  4. Turnover:    Σ |w_i - w_{0,i}| ≤ 0.15
  5. Stress Cap:  Σ_{i ∈ Eq} w_i ≤ 0.40
  6. Return:      μ^T w ≥ 0.07
""")

def print_qubo_equation(Q):
    print("\n" + "="*75)
    print("⚛️ 2. QUBO FORMULATION & ENCODING")
    print("="*75)
    print("""
Quadratic Unconstrained Binary Optimization (QUBO):
  min_{x ∈ {0,1}^n}  x^T Q x
  
  Where Q is an n×n upper-triangular symmetric matrix.
  Constraints are mapped as quadratic penalty terms:
  H(x) = O(w) + P_budget*(Σw - 1)^2 + P_ret*(μ^Tw - ε)^2 + ...
""")
    print("Sample QUBO Matrix Snippet (Top-Left 6x6):")
    np.set_printoptions(precision=2, suppress=True)
    print(Q[:6, :6])
    
    print("""
Binary Encoding (6 Bits per Asset):
  - Why 6 bits? It provides 2^6 - 1 = 63 discrete states.
  - Precision (Δ): max_weight / 63 = 0.25 / 63 ≈ 0.397% per step.
  - This balances quantum resource limits (qubits) with financial 
    precision requirements (sub-0.5% granularity).
""")

def print_quantum_circuit():
    print("\n" + "="*75)
    print("🔬 3. QUANTUM CIRCUIT DIAGRAM (QAOA p=3)")
    print("="*75)
    print("""
      |0⟩ ──── H ──[e^{-iβ_1 H_M}]──[e^{-iγ_1 H_C}]── ... ──[e^{-iβ_3 H_M}]──[e^{-iγ_3 H_C}]── M ──
      
      Initial State: |+⟩^⊗n (Uniform Superposition via Hadamard gates)
      H_C: Cost Hamiltonian (Encodes the QUBO matrix via Pauli-Z rotations)
      H_M: Mixer Hamiltonian (Pauli-X rotations to explore state space)
      M:  Measurement in computational basis
""")

def print_research_discussion():
    print("\n" + "="*75)
    print("🎓 4. RESEARCH DISCUSSION & EVALUATION")
    print("="*75)
    print("""
Why QAOA / Quantum Annealing?
  Standard convex optimization struggles with discrete variables and 
  non-convex constraints. QUBO mapping allows the quantum annealer to 
  tunnel through energy barriers, finding global minimums in a high-dimensional
  discrete space (2^78 configurations) more efficiently than brute-force.

Why Hybrid Optimization?
  Quantum hardware is noisy and limited in qubit count. Purely quantum 
  solutions often violate hard constraints (like budget=1) due to soft penalties.
  The Hybrid approach uses Quantum for global structure search, and Classical 
  (SLSQP/NSGA-II) for strict boundary polishing, guaranteeing zero breaches.

Limitations & Future Work:
  - Current simulation uses Simulated Annealing. True gate-model QAOA on 
    hardware (e.g., IBM Heron) will introduce noise and decoherence.
  - Future work: Implement Domain-Wall encoding instead of binary to reduce 
    circuit depth and two-qubit gate count.
""")