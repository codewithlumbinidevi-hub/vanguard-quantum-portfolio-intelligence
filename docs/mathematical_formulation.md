# Mathematical Formulation: Q-MAT & Vanguard Quantum Hybrid Multi-Asset Portfolio Construction

## Executive Abstract

This document presents the unified mathematical formulation underlying **Vanguard Quantum** and **Q-MAT (Quantum Multi-Asset Terminal)** — an institutional-grade, hybrid quantum-classical architecture for multi-asset portfolio construction. The system translates a guarded Markowitz mean-variance optimization problem into a **78-variable QUBO/Ising formulation** compatible with QAOA and quantum annealing-based solvers. Candidate discrete allocations are passed to a constrained SLSQP (Sequential Least Squares Programming) classical polisher utilizing a differentiable Pseudo-Huber turnover surrogate. Portfolios are accepted only after explicit post-solve verification against institutional budget, position, sector, turnover, stress, and liquidity guardrails.

All formulations in this document unify the exact mathematical specifications from the **Q-MAT Technical Overview & Challenge Deliverables Paper**, the **Factor-QAOA Research Paper**, and the active software repository.

---

## Table of Contents

1. [Symbol Glossary & Basic Portfolio Quantities](#1-symbol-glossary--basic-portfolio-quantities)
2. [Continuous Mean-Variance Optimization & Portfolio Objectives](#2-continuous-mean-variance-optimization--portfolio-objectives)
3. [Financial Data & Risk Modeling Strategy](#3-financial-data--risk-modeling-strategy)
   - [3.1 Statistical PCA Factor Covariance Estimation](#31-statistical-pca-factor-covariance-estimation)
   - [3.2 Black-Litterman Bayesian Return Estimation](#32-black-litterman-bayesian-return-estimation)
   - [3.3 Geometric Brownian Motion Monte Carlo Scenarios](#33-geometric-brownian-motion-monte-carlo-scenarios)
   - [3.4 Protective Put Derivative Valuation (Black-Scholes Model)](#34-protective-put-derivative-valuation-black-scholes-model)
4. [Institutional Guardrails & Hard Compliance Constraints](#4-institutional-guardrails--hard-compliance-constraints)
5. [Quantum-Compatible QUBO & Ising Mapping](#5-quantum-compatible-qubo--ising-mapping)
   - [5.1 Binary Decision Encoding (78-Variable Representation)](#51-binary-decision-encoding-78-variable-representation)
   - [5.2 Analytical QUBO Matrix Formulation ($Q$)](#52-analytical-qubo-matrix-formulation-q)
   - [5.3 Dynamic Spectral Penalty Scaling](#53-dynamic-spectral-penalty-scaling)
   - [5.4 Ising Spin Hamiltonian Transformation ($H_C$)](#54-ising-spin-hamiltonian-transformation-h_c)
6. [QAOA Quantum Circuit & Variational Optimization Workflow](#6-qaoa-quantum-circuit--variational-optimization-workflow)
7. [Two-Stage Hybrid Solver & SLSQP Polishing (Pseudo-Huber Surrogate)](#7-two-stage-hybrid-solver--slsqp-polishing-pseudo-huber-surrogate)
8. [Comprehensive Risk-Adjusted Evaluation Metrics](#8-comprehensive-risk-adjusted-evaluation-metrics)
9. [System Architecture & Codebase Component Mapping](#9-system-architecture--codebase-component-mapping)

---

## 1. Symbol Glossary & Basic Portfolio Quantities

| Symbol | Called | Meaning |
| :--- | :--- | :--- |
| $P_{i,t}$ | Asset Price | Closing or adjusted price of asset $i$ at discrete time $t$ |
| $r_{i,t}, \mathbf{r}_t$ | Asset Return | One-period return of asset $i$, or return vector across $N$ assets at time $t$ |
| $w_i, \mathbf{w}$ | Portfolio Weight | Fraction invested in asset $i$, or complete allocation vector $\mathbf{w} \in \mathbb{R}^N$ |
| $\mathbf{w}^{(0)}$ | Initial Portfolio | Pre-trade portfolio weights held prior to rebalancing |
| $\boldsymbol{\mu}, \mu_p$ | Expected Return | Expected asset return vector $\boldsymbol{\mu}$ and portfolio return $\mu_p = \boldsymbol{\mu}^T \mathbf{w}$ |
| $\boldsymbol{\mu}_{\text{BL}}$ | Black-Litterman Return | Posterior expected return vector blending equilibrium prior and investor views |
| $\Sigma$ | Covariance Matrix | Annualized asset return covariance matrix $\Sigma \in \mathbb{R}^{N \times N}$ |
| $\sigma_p, \sigma_p^2$ | Portfolio Volatility | Portfolio return standard deviation $\sigma_p = \sqrt{\mathbf{w}^T \Sigma \mathbf{w}}$ and variance |
| $B, \Sigma_F, D$ | PCA Factor Components | Factor loadings matrix $B$, factor covariance $\Sigma_F$, and diagonal residual risk $D$ |
| $\lambda$ | Risk-Aversion Coefficient | Multiplier controlling penalty on portfolio variance in objective function |
| $\gamma$ | Trading Regularizer | Penalty coefficient for trading away from initial allocation $\mathbf{w}^{(0)}$ |
| $\epsilon$ | Return Target | Requested minimum annualized portfolio expected return |
| $r_f$ | Risk-Free Rate | Reference yield (10-Year US Treasury) for Sharpe, CAPM, and option pricing |
| $c_i$ | Trading-Cost Rate | Proportional transaction cost for changing weight of asset $i$ |
| $\ell_i$ | Liquidity Limit | Maximum allowable portfolio weight permitted by tradable volume rules |
| $\mathcal{S}_k, \mathcal{E}$ | Asset Subsets | Assets belonging to sector $k$ ($\mathcal{S}_k$), or equity asset class ($\mathcal{E}$) |
| $\Delta_i$ | Weight Grid Increment | Smallest representable change in encoded weight for asset $i$ |
| $x_{i,j}$ | Binary Variable | Bit $j$ used to encode binary representation of weight for asset $i$ |
| $A$ | Encoding Matrix | Linear mapping matrix from binary vector $\mathbf{x}$ to weights $\mathbf{w} = A \mathbf{x}$ |
| $Q$ | QUBO Matrix | Upper-triangular/symmetric matrix containing binary biases & pairwise couplings |
| $P_{\text{bud}}, P_{\text{ret}}$ | Penalty Strengths | Multipliers enforcing budget and target-return soft penalties in QUBO |
| $H_C, H_M$ | Hamiltonians | Cost (Ising) Hamiltonian $H_C$ and Transverse-Field Mixer Hamiltonian $H_M$ |
| $h_i, J_{ij}$ | Ising Coefficients | Local field on spin $i$ ($h_i$) and pairwise coupling between spins $i, j$ ($J_{ij}$) |
| $Z_i, X_i$ | Pauli Operators | Pauli-Z operator for cost encoding; Pauli-X operator for quantum mixer |
| $U_P(\gamma_k), U_M(\beta_k)$ | QAOA Unitaries | Problem unitary $U_P$ and Mixer unitary $U_M$ applied at layer $k$ |
| $\gamma_k, \beta_k, p$ | QAOA Parameters | Variational angles at layer $k$, and circuit depth $p$ |
| $\boldsymbol{\Pi}, P, \mathbf{q}, \Omega, \tau$ | Black-Litterman Terms | Prior equilibrium returns $\boldsymbol{\Pi}$, pick matrix $P$, views $\mathbf{q}$, uncertainty $\Omega$, scalar $\tau$ |
| $S_0, K, T, \Phi$ | Option Quantities | Spot price $S_0$, strike $K$, time $T$, standard normal cumulative distribution $\Phi$ |
| $\text{TO}(\mathbf{w})$ | Portfolio Turnover | Absolute total weight change $\sum_{i=1}^N |w_i - w_i^{(0)}|$ |
| $\text{VaR}_\alpha, \text{CVaR}_\alpha$ | Tail Risk | Value at Risk and Conditional VaR at confidence quantile $\alpha$ |
| $\beta_p, \alpha_p$ | CAPM Statistics | Portfolio market beta sensitivity $\beta_p$ and regression alpha $\alpha_p$ |

---

## 2. Continuous Mean-Variance Optimization & Portfolio Objectives

### 2.1 One-Period Returns and Annualized Sample Estimates

For asset $i$ with closing prices $P_{i,t}$, the simple one-period return at time $t$ is:

$$r_{i,t} = \frac{P_{i,t} - P_{i,t-1}}{P_{i,t-1}} = \frac{P_{i,t}}{P_{i,t-1}} - 1$$

Given $T$ daily observations and annualization scaling factor $A = 252$ trading days:

$$\hat{\boldsymbol{\mu}} = \frac{A}{T} \sum_{t=1}^T \mathbf{r}_t, \quad \hat{\Sigma} = \frac{A}{T-1} \sum_{t=1}^T (\mathbf{r}_t - \bar{\mathbf{r}})(\mathbf{r}_t - \bar{\mathbf{r}})^T$$

For a given allocation weight vector $\mathbf{w} \in \mathbb{R}^N$:

$$\mu_p = \boldsymbol{\mu}^T \mathbf{w}, \quad \sigma_p^2 = \mathbf{w}^T \Sigma \mathbf{w}, \quad \sigma_p = \sqrt{\mathbf{w}^T \Sigma \mathbf{w}}, \quad \text{Sharpe}(\mathbf{w}) = \frac{\mu_p - r_f}{\sigma_p}$$

### 2.2 Smooth Objective Function with Trading Regularizer

To balance risk minimization, return maximization, and turnover cost control relative to initial allocation $\mathbf{w}^{(0)}$, Q-MAT defines the continuous objective function:

$$\mathcal{O}(\mathbf{w}) = \lambda \mathbf{w}^T \Sigma \mathbf{w} - \boldsymbol{\mu}^T \mathbf{w} + \gamma \sum_{i=1}^N \left( w_i - w_i^{(0)} \right)^2$$

Where:
- $\lambda > 0$ controls investor risk aversion.
- $\gamma \ge 0$ penalizes continuous quadratic deviation from initial pre-trade portfolio weights.

### 2.3 Exact $L_1$ Portfolio Turnover & Proportional Transaction Cost

The exact portfolio turnover $\text{TO}(\mathbf{w})$ and round-trip trading cost $C_{\text{trade}}(\mathbf{w})$ are modeled as:

$$\text{TO}(\mathbf{w}) = \sum_{i=1}^N |w_i - w_i^{(0)}|, \quad C_{\text{trade}}(\mathbf{w}) = \sum_{i=1}^N c_i |w_i - w_i^{(0)}|$$

Where $c_i$ represents the proportional transaction fee per unit weight change.

---

## 3. Financial Data & Risk Modeling Strategy

### 3.1 Statistical PCA Factor Covariance Estimation

Empirical sample covariance matrices $\hat{\Sigma}$ suffer from estimation noise when asset dimension $N$ is large relative to history $T$. To eliminate sampling noise, Q-MAT extracts latent risk factors via Principal Component Analysis (PCA):

$$\mathbf{r}_t = B \mathbf{f}_t + \boldsymbol{\varepsilon}_t, \quad \Sigma_{\text{factor}} = B \Sigma_F B^T + D$$

Where:
- $B \in \mathbb{R}^{N \times K_{\text{factor}}}$ contains the factor loadings (retained principal component eigenvectors).
- $\Sigma_F \in \mathbb{R}^{K_{\text{factor}} \times K_{\text{factor}}}$ is the diagonal covariance matrix of principal factor returns.
- $D \in \mathbb{R}^{N \times N}$ is the diagonal matrix of specific idiosyncratic asset risks ($D_{ii} = \max\left(0, \hat{\Sigma}_{ii} - (B \Sigma_F B^T)_{ii}\right)$).

### 3.2 Black-Litterman Bayesian Return Estimation

To prevent extreme allocations caused by noisy historical sample means, Q-MAT blends market equilibrium returns with scenario views:

$$\boldsymbol{\Pi} = \delta \Sigma \mathbf{w}_{\text{mkt}}$$

$$\boldsymbol{\mu}_{\text{BL}} = \left[ (\tau \Sigma)^{-1} + P^T \Omega^{-1} P \right]^{-1} \left[ (\tau \Sigma)^{-1} \boldsymbol{\Pi} + P^T \Omega^{-1} \mathbf{q} \right]$$

Where:
- $\delta = \frac{E[R_m] - R_f}{\sigma_m^2}$ is market risk aversion.
- $P$ is the view selection pick matrix, $\mathbf{q}$ is the scenario vector, $\Omega$ is view uncertainty, $\tau \approx 0.05$ scales prior uncertainty.

### 3.3 Geometric Brownian Motion Monte Carlo Scenarios

Forward-looking price dynamics for asset price $S_t$ follow Geometric Brownian Motion (GBM):

$$d S_t = \mu_S S_t d t + \sigma_S S_t d W_t$$

Simulating discrete paths with time step $\Delta t = 1/252$:

$$S_{t+\Delta t} = S_t \exp\left[ \left(\mu_S - \frac{1}{2} \sigma_S^2\right) \Delta t + \sigma_S \sqrt{\Delta t} \cdot Z_t \right], \quad Z_t \sim \mathcal{N}(0, 1)$$

### 3.4 Protective Put Derivative Valuation (Black-Scholes Model)

To evaluate tail-risk downside protection, a European protective put option is modeled as a 13th candidate instrument ($N=13$):

$$P_0 = K e^{-r T} \Phi(-d_2) - S_0 \Phi(-d_1)$$

$$d_1 = \frac{\ln(S_0 / K) + \left(r + \frac{1}{2} \sigma^2\right) T}{\sigma \sqrt{T}}, \quad d_2 = d_1 - \sigma \sqrt{T}$$

Where $\Phi(\cdot)$ is the standard normal cumulative distribution function. At expiry $T$, the gross position payoff is:

$$\text{Payoff}(S_T) = S_T + \max(K - S_T, 0) = \max(S_T, K)$$

---

## 4. Institutional Guardrails & Hard Compliance Constraints

Every acceptable portfolio allocation $\mathbf{w}$ must satisfy six hard institutional compliance limits:

1. **Full Investment Budget Constraint:**
   $$\sum_{i=1}^N w_i = 1$$

2. **Position Weight Limits (Max 25% Cap):**
   $$0 \le w_i \le 0.25 \quad \forall i \in \{1, \dots, N\}$$

3. **Sector Exposure Limits (Max 40% per Sector):**
   $$\sum_{i \in \mathcal{S}_k} w_i \le 0.40 \quad \forall k$$

4. **Turnover Limit (Max 15% Rebalance Turnover):**
   $$\sum_{i=1}^N |w_i - w_i^{(0)}| \le 0.15$$

5. **Equity Stress Cap (Max 40% Total Equity Exposure):**
   $$\sum_{i \in \mathcal{E}} w_i \le 0.40$$

6. **Liquidity Limits:**
   $$w_i \le \ell_i \quad \forall i \in \{1, \dots, N\}$$

7. **Target Expected Return Goal:**
   $$\boldsymbol{\mu}^T \mathbf{w} \ge \epsilon$$

---

## 5. Quantum-Compatible QUBO & Ising Mapping

### 5.1 Binary Decision Encoding (78-Variable Representation)

To transform continuous weights $w_i \in [0, 0.25]$ into binary quantum state variables, each asset weight is represented using $m = 6$ binary decision bits ($x_{i,j} \in \{0, 1\}$):

$$w_i = \Delta_i \sum_{j=0}^5 2^j x_{i,j}, \quad x_{i,j} \in \{0, 1\}$$

For a $25\%$ position cap ($w_{\max} = 0.25$), setting:

$$\Delta_i = \frac{0.25}{2^6 - 1} = \frac{0.25}{63} \approx 0.00396825 \quad (\approx 0.397 \text{ percentage points grid resolution})$$

For $13$ candidate instruments ($12$ anonymized ETFs + $1$ protective put), this discretization yields:

$$N_{\text{qubits}} = 13 \times 6 = 78 \text{ binary decision variables} \quad (\mathbf{x} \in \{0, 1\}^{78})$$

In compact matrix form, $\mathbf{w} = A \mathbf{x}$, where $A \in \mathbb{R}^{13 \times 78}$ is the linear weight encoding matrix.

### 5.2 Analytical QUBO Matrix Formulation ($Q$)

Substituting $\mathbf{w} = A \mathbf{x}$ into objective $\mathcal{O}(\mathbf{w})$ and adding quadratic penalty terms for budget and return target shortfalls:

$$H(\mathbf{x}) = \mathcal{O}(A \mathbf{x}) + P_{\text{bud}} \left( \mathbf{1}^T A \mathbf{x} - 1 \right)^2 + P_{\text{ret}} \left[ \boldsymbol{\mu}^T A \mathbf{x} - \epsilon \right]^2$$

Expanding terms into canonical QUBO format:

$$\min_{\mathbf{x} \in \{0, 1\}^{78}} \mathbf{x}^T Q \mathbf{x}$$

Expanding quadratic risk and turnover terms:

$$\lambda \mathbf{x}^T A^T \Sigma A \mathbf{x} + \gamma (A \mathbf{x} - \mathbf{w}^{(0)})^T (A \mathbf{x} - \mathbf{w}^{(0)})$$

Using $x_{k}^2 = x_k$ for binary variables, the diagonal ($Q_{kk}$) and off-diagonal ($Q_{kl}$) matrix entries are constructed as:

- **Diagonal Terms ($Q_{kk}$):**
  $$Q_{kk} = \lambda (A^T \Sigma A)_{kk} - (\boldsymbol{\mu}^T A)_k + \gamma \left( (A^T A)_{kk} - 2 (A^T \mathbf{w}^{(0)})_k \right) + P_{\text{bud}} \left( (A^T \mathbf{1}\mathbf{1}^T A)_{kk} - 2 (A^T \mathbf{1})_k \right)$$

- **Off-Diagonal Terms ($Q_{kl}$ for $k \neq l$):**
  $$Q_{kl} = 2 \lambda (A^T \Sigma A)_{kl} + 2 \gamma (A^T A)_{kl} + 2 P_{\text{bud}} (A^T \mathbf{1}\mathbf{1}^T A)_{kl}$$

### 5.3 Dynamic Spectral Penalty Scaling

To ensure penalty terms scale appropriately without erasing objective resolution, Q-MAT computes the maximum covariance eigenvalue $\lambda_{\max}(\Sigma)$ via spectral decomposition:

$$P_{\text{bud}} > \lambda_{\max}(\Sigma), \quad P_{\text{ret}} > \lambda_{\max}(\Sigma)$$

This dynamic scaling avoids penalties that are too weak to enforce feasibility or so large that they destroy energy landscape contrast.

### 5.4 Ising Spin Hamiltonian Transformation ($H_C$)

Binary variables are mapped to Pauli-Z spin operators $Z_k \in \{+1, -1\}$ via:

$$x_k = \frac{1 - Z_k}{2}$$

For a symmetric QUBO $\mathbf{x}^T Q \mathbf{x} = \sum_k Q_{kk} x_k + 2 \sum_{k < l} Q_{kl} x_k x_l$, the Cost Ising Hamiltonian is:

$$H_C = c + \sum_k h_k Z_k + \sum_{k < l} J_{kl} Z_l Z_l$$

Where spin interaction coefficients are derived as:

$$J_{kl} = \frac{Q_{kl}}{2}, \quad h_k = -\frac{Q_{kk}}{2} - \frac{1}{2} \sum_{l \neq k} Q_{kl}$$

$$c = \frac{1}{2} \sum_k Q_{kk} + \frac{1}{4} \sum_{k < l} Q_{kl}$$

---

## 6. QAOA Quantum Circuit & Variational Optimization Workflow

The Quantum Approximate Optimization Algorithm (QAOA) prepares a variational quantum state over $n = 78$ qubits:

1. **Initial State Preparation:**
   $$|+\rangle^{\otimes 78} = \frac{1}{\sqrt{2^{78}}} \sum_{\mathbf{x} \in \{0, 1\}^{78}} |\mathbf{x}\rangle = \bigotimes_{i=1}^{78} H |0\rangle$$

2. **Alternating Problem and Mixer Unitaries ($p$ Layers):**
   - **Problem Unitary:** $U_P(\gamma_k) = e^{-i \gamma_k H_C}$
   - **Mixer Unitary:** $U_M(\beta_k) = e^{-i \beta_k \sum_{j=1}^{78} X_j}$

   Parameterized $p$-layer state:
   $$|\psi(\boldsymbol{\gamma}, \boldsymbol{\beta})\rangle = \left( \prod_{k=1}^p U_M(\beta_k) U_P(\gamma_k) \right) |+\rangle^{\otimes 78}$$

3. **Measurement & Variational Parameter Optimization:**
   The expectation value $\langle H_C \rangle = \langle \psi(\boldsymbol{\gamma}, \boldsymbol{\beta}) | H_C | \psi(\boldsymbol{\gamma}, \boldsymbol{\beta}) \rangle$ is minimized via classical Adam optimizer:

   $$(\boldsymbol{\gamma}^*, \boldsymbol{\beta}^*) = \arg\min_{\boldsymbol{\gamma}, \boldsymbol{\beta}} \langle H_C \rangle$$

4. **Bitstring Measurement & Candidate Selection:**
   Sampling $10,000$ measurement shots yields state probabilities $P(\mathbf{x}) = |\langle \mathbf{x} | \psi(\boldsymbol{\gamma}^*, \boldsymbol{\beta}^*) \rangle|^2$. The lowest-energy bitstring $\mathbf{x}^*$ is decoded into initial weight candidate $\mathbf{w}^{(c)} = A \mathbf{x}^*$.

---

## 7. Two-Stage Hybrid Solver & SLSQP Polishing (Pseudo-Huber Surrogate)

Q-MAT operates as a two-stage hybrid solver combining discrete global search with exact continuous constraint enforcement:

```
[ Stage 1: Discrete QUBO / Ising Search ] 
  ---> Generates Candidate Bitstring x* ---> Decodes Candidate Weights w^(c) = A x*
                                                        |
[ Stage 2: Constrained SLSQP Polishing ] <--------------+
  ---> Optimizes Continuous Weights w starting from w^(c)
  ---> Differentiable Pseudo-Huber Turnover Surrogate: φ_δ(z) = δ^2 * (sqrt(1 + (z/δ)^2) - 1)
                                                        |
[ Stage 3: Exact Post-Solve Compliance Validator ] <---+
  ---> Checks hard L1 Turnover <= 15%, Budget = 100%, Position Caps <= 25%, Sector Limits <= 40%
```

### 7.1 Stage 1: Discrete Candidate Generation
Simulated Annealing (`neal` sampler) or QAOA explores the 78-dimensional discrete search space, returning low-energy candidate allocation $\mathbf{w}^{(c)}$.

### 7.2 Stage 2: Continuous SLSQP Polishing with Pseudo-Huber Surrogate
To solve continuous optimization starting from $\mathbf{w}^{(c)}$, SLSQP requires differentiable functions. The non-differentiable $L_1$ turnover term $|w_i - w_i^{(0)}|$ is approximated by a smooth **Pseudo-Huber surrogate function**:

$$\phi_\delta(z) = \delta^2 \left( \sqrt{1 + \left(\frac{z}{\delta}\right)^2} - 1 \right)$$

Where $\delta > 0$ controls transition smoothness ($\phi_\delta(z) \approx |z|$ for $|z| \gg \delta$).

### 7.3 Stage 3: Hard Compliance Validation
Final acceptance is evaluated against **exact non-differentiable $L_1$ constraints**, not the surrogate approximation. Zero breaches are permitted.

---

## 8. Comprehensive Risk-Adjusted Evaluation Metrics

Given periodic portfolio returns $r_{p,t}$ and benchmark returns $r_{b,t}$:

| Evaluation Metric | Mathematical Definition | Technical Description |
| :--- | :--- | :--- |
| **Cumulative Return** | $R_{\text{cum}} = \prod_{t=1}^T (1 + r_{p,t}) - 1$ | Net fractional portfolio growth over period |
| **Terminal Wealth** | $V_T = \prod_{t=1}^T (1 + r_{p,t}) = 1 + R_{\text{cum}}$ | Wealth index value starting from $\$1.00$ base |
| **Downside Volatility** | $\sigma_{\text{down}} = \sqrt{\mathbb{E}[\min(r_p - r_f, 0)^2]}$ | Standard deviation of negative excess returns |
| **Sortino Ratio** | $\text{Sortino} = \frac{\mathbb{E}[r_p] - r_f}{\sigma_{\text{down}}}$ | Excess return annualized over downside risk |
| **Value at Risk ($\text{VaR}_\alpha$)** | $\text{VaR}_\alpha(L) = \inf \{ \ell : \text{Pr}(L \le \ell) \ge \alpha \}$ | Maximum expected loss at quantile $\alpha$ ($L = -r_p$) |
| **Conditional VaR ($\text{CVaR}_\alpha$)** | $\text{CVaR}_\alpha(L) = \mathbb{E}[L \mid L \ge \text{VaR}_\alpha]$ | Expected shortfall loss beyond $\text{VaR}_\alpha$ threshold |
| **Market Beta ($\beta_p$)** | $\beta_p = \frac{\text{Cov}(r_p, r_b)}{\text{Var}(r_b)}$ | Systemic covariance sensitivity to market proxy |
| **CAPM Alpha ($\alpha_p$)** | $\alpha_p = \mathbb{E}[r_p] - \left( r_f + \beta_p (\mathbb{E}[r_b] - r_f) \right)$ | Regression excess return above market expectation |
| **Tracking Error ($\text{TE}$)** | $\text{TE} = \text{Std}(r_p - r_b)$ | Standard deviation of active return differentials |
| **Information Ratio ($\text{IR}$)** | $\text{IR} = \frac{\mathbb{E}[r_p - r_b]}{\text{TE}}$ | Active excess return generated per unit active risk |
| **Maximum Drawdown ($\text{MDD}$)** | $\text{MDD} = \min_t \left( \frac{V_t}{\max_{s \le t} V_s} - 1 \right)$ | Maximum peak-to-trough percentage wealth decline |
| **Calmar Ratio** | $\text{Calmar} = \frac{R_{\text{ann}}}{|\text{MDD}|}$ | Annualized return normalized by maximum drawdown |

---

## 9. System Architecture & Codebase Component Mapping

| Software File / Module | Mathematical Formulation Covered | Primary Code Functions |
| :--- | :--- | :--- |
| `Collective_Qubits...ipynb` | PCA Factor Model, 78-bit QUBO $Q$, $H_C$, QAOA Circuit | `PCA.fit_transform()`, `build_qaoa_cost_hamiltonian()`, `qml.qnode` |
| `src/services/api.ts` | Mean-Variance Return, Volatility, Sharpe, Sortino, VaR 95%, GBM Monte Carlo | `computeFallbackPortfolio()`, `analyzePortfolioApi()`, `monteCarlo` loop |
| `src/lib/riskGuardrails.ts` | Position Limits ($w_i \le 25\%$), Turnover Cap ($15\%$), Liquidity Limits | `validatePortfolioGuardrails()`, `enforceConcentrationCap()` |
| `src/components/analytics/MacroRegimeTracker.tsx` | Stock-Bond Correlation $\rho_{\text{stock,bond}}$, Duration Shift | `currentCorrelation`, `handleShiftRegime()` |
| `src/components/portfolio/TaxOptimizationPanel.tsx` | Capital Loss $L_{\text{harvest}}$, Tax Credit $T_{\text{saved}}$, 30-Day Wash-Sale Swap | `handleHarvestAndSwap()`, `opportunities` |
| `src/components/analytics/StressTestPanel.tsx` | Black-Litterman Posterior Stress Scenarios (1970s, 2008, 2022) | `scenarios`, `activeScenario`, `vanguardStaticDrawdown` |
| `server/index.js` | REST Backend Financial Calculation Routes | `calculatePortfolioMetrics()`, `/api/portfolio/analyze` |
