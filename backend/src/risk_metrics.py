import numpy as np
import scipy.stats as stats

def calculate_risk_metrics(final_weights, data, config):
    """
    Calculates exact risk-adjusted evaluation metrics as specified in docs/mathematical_formulation.md:
    Mean-Variance Return, Volatility, Sharpe, Sortino, VaR 95%, CVaR 95%, Beta, Alpha,
    Tracking Error, Information Ratio, Max Drawdown, Calmar Ratio, Treynor Ratio,
    Diversification Ratio, Risk Score, and Health Score.
    """
    final_weights = np.asarray(final_weights, dtype=float)
    mu = np.asarray(data['mu'], dtype=float)
    Sigma = np.asarray(data['Sigma'], dtype=float)
    rf = float(config.get('rf', 0.0415))
    
    # Portfolio expected return and volatility (annualized)
    port_ret = float(np.dot(final_weights, mu))
    port_vol = float(np.sqrt(np.dot(final_weights, np.dot(Sigma, final_weights))))
    
    # Sharpe Ratio
    sharpe = (port_ret - rf) / max(port_vol, 1e-6)
    
    # Generate Monte Carlo / Historical daily return path (252 steps, 5000 paths) for exact tail risk & downside metrics
    n_assets = len(final_weights)
    if 'daily_returns' in data and data['daily_returns'] is not None:
        asset_returns = np.asarray(data['daily_returns'])
        port_daily = np.dot(asset_returns, final_weights)
    else:
        np.random.seed(42)
        n_days = 252
        daily_mu = mu / 252.0
        daily_cov = Sigma / 252.0
        # Multi-variate normal simulation for daily returns
        sim_daily = np.random.multivariate_normal(daily_mu, daily_cov, size=(n_days, 1000)) # (252, 1000, N)
        port_daily = np.einsum('tdn,n->td', sim_daily, final_weights).flatten() # (252*1000,)
        
    daily_rf = rf / 252.0
    excess_daily = port_daily - daily_rf
    
    # 1. Downside Volatility & Sortino Ratio (Exact sample downside deviation)
    negative_excess = np.minimum(excess_daily, 0.0)
    downside_variance = np.mean(negative_excess**2) * 252.0
    downside_dev = np.sqrt(downside_variance)
    sortino = (port_ret - rf) / max(downside_dev, 1e-6)
    
    # 2. Exact Value at Risk (VaR 95%) & Conditional VaR (CVaR 95%)
    var_95 = float(np.percentile(-port_daily, 95)) * np.sqrt(252.0)
    tail_losses = -port_daily[-port_daily >= np.percentile(-port_daily, 95)]
    cvar_95 = float(np.mean(tail_losses)) * np.sqrt(252.0) if len(tail_losses) > 0 else var_95
    
    # 3. Market Beta & Alpha (CAPM vs Benchmark asset at index 0 or market proxy)
    mkt_idx = 0 if n_assets > 0 else 0
    mkt_var = float(Sigma[mkt_idx, mkt_idx])
    cov_port_mkt = float(np.dot(final_weights, Sigma[:, mkt_idx]))
    beta = cov_port_mkt / max(mkt_var, 1e-6)
    market_ret = float(mu[mkt_idx])
    alpha = port_ret - (rf + beta * (market_ret - rf))
    
    # 4. Tracking Error & Information Ratio vs Equal-Weight benchmark
    eq_weights = np.ones(n_assets) / float(n_assets)
    eq_ret = float(np.dot(eq_weights, mu))
    active_ret = final_weights - eq_weights
    tracking_error = float(np.sqrt(np.dot(active_ret, np.dot(Sigma, active_ret))))
    info_ratio = (port_ret - eq_ret) / max(tracking_error, 1e-6)
    
    # 5. Maximum Drawdown (MDD) & Calmar Ratio (Peak-to-trough path evaluation)
    cum_returns = np.cumprod(1.0 + port_daily[:252])
    running_max = np.maximum.accumulate(cum_returns)
    drawdowns = (cum_returns - running_max) / running_max
    max_dd = float(np.min(drawdowns))
    calmar = port_ret / abs(max_dd) if abs(max_dd) > 1e-6 else 0.0
    
    # 6. Treynor Ratio & Diversification Ratio
    treynor = (port_ret - rf) / beta if abs(beta) > 1e-6 else 0.0
    asset_vols = np.sqrt(np.diag(Sigma))
    weighted_vol = float(np.dot(final_weights, asset_vols))
    diversification_ratio = weighted_vol / max(port_vol, 1e-6)
    
    # 7. Risk Score & Health Score derived mathematically
    risk_score = int(np.clip(np.round(port_vol * 350.0), 15, 99))
    health_score = int(np.clip(np.round(50.0 + 15.0 * sharpe + 10.0 * diversification_ratio - 30.0 * abs(max_dd)), 0, 100))
    
    results = {
        'expected_return': port_ret,
        'volatility': port_vol,
        'sharpe_ratio': sharpe,
        'sortino_ratio': sortino,
        'downside_deviation': downside_dev,
        'var_95': var_95,
        'cvar_95': cvar_95,
        'beta': beta,
        'alpha': alpha,
        'tracking_error': tracking_error,
        'information_ratio': info_ratio,
        'max_drawdown': max_dd,
        'calmar_ratio': calmar,
        'treynor_ratio': treynor,
        'diversification_ratio': diversification_ratio,
        'risk_score': risk_score,
        'health_score': health_score
    }
    
    print("\n--- Advanced Portfolio Risk Metrics (Mathematically Derived) ---")
    for k, v in results.items():
        print(f"{k:24s}: {v:.4f}")
    print("-" * 50)
    
    return results