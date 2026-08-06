import os
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_sample_runs()


def seed_sample_runs():
    from backend.models import OptimizationRun

    if OptimizationRun.query.first():
        return

    sample_runs = [
        {
            'profile_name': 'Conservative Hybrid Engine',
            'status': 'COMPLETED',
            'config': {'algorithm': 'QAOA', 'target_risk': 0.08, 'depth': 4},
            'weights': {'AAPL': 0.10, 'MSFT': 0.08, 'AGG': 0.32, 'GLD': 0.12, 'SPY': 0.18, 'BIL': 0.10, 'VNQ': 0.10},
            'metrics': {'expected_return': 0.082, 'expected_volatility': 0.078, 'sharpe_ratio': 1.74},
            'constraints': {'max_asset_weight': 0.20, 'min_cash_buffer': 0.08},
            'frontier': {'curve': [{'return': 0.06, 'risk': 0.04}, {'return': 0.075, 'risk': 0.06}, {'return': 0.085, 'risk': 0.075}]},
            'ai_memo': 'Balanced low-volatility portfolio designed for downside protection.',
            'circuit_diagram': None,
            'expert_analysis': {'summary': 'Stable exposure with disciplined asset caps.'},
            'qubo_snippet': []
        },
        {
            'profile_name': 'Dynamic Growth Builder',
            'status': 'COMPLETED',
            'config': {'algorithm': 'VQE', 'target_risk': 0.12, 'depth': 6},
            'weights': {'AAPL': 0.15, 'MSFT': 0.12, 'NVDA': 0.10, 'SPY': 0.16, 'GLD': 0.08, 'BTC': 0.06, 'BIL': 0.08, 'VNQ': 0.12, 'AGG': 0.13},
            'metrics': {'expected_return': 0.114, 'expected_volatility': 0.112, 'sharpe_ratio': 2.03},
            'constraints': {'max_asset_weight': 0.22, 'max_crypto_allocation': 0.08},
            'frontier': {'curve': [{'return': 0.08, 'risk': 0.055}, {'return': 0.098, 'risk': 0.075}, {'return': 0.115, 'risk': 0.095}]},
            'ai_memo': 'Growth-oriented portfolio using quantum-enhanced frontier expansion.',
            'circuit_diagram': None,
            'expert_analysis': {'summary': 'Selective risk build with a cash buffer and alternative tilt.'},
            'qubo_snippet': []
        }
    ]

    for run_data in sample_runs:
        run = OptimizationRun(**run_data)
        db.session.add(run)

    db.session.commit()
