import os
import sys

# Ensure project root is on sys.path so `backend` package is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend import create_app
from backend.db import db
from backend.models import OptimizationRun

app = create_app()

SAMPLE = [
    {
        'profile_name': 'Conservative Institutional Seed',
        'status': 'COMPLETED',
        'config': {'algorithm':'QAOA','target_risk':0.08},
        'weights': {'AAPL':0.18,'MSFT':0.15,'AGG':0.20,'GLD':0.10,'SPY':0.15,'BTC':0.02,'EURUSD':0.05},
        'metrics': {'expected_return':0.09,'expected_volatility':0.08,'sharpe_ratio':1.12}
    },
    {
        'profile_name': 'Balanced Growth Seed',
        'status': 'COMPLETED',
        'config': {'algorithm':'Hybrid','target_risk':0.10},
        'weights': {'AAPL':0.14,'MSFT':0.12,'NVDA':0.10,'SPY':0.20,'AGG':0.10,'GLD':0.08,'BTC':0.06},
        'metrics': {'expected_return':0.11,'expected_volatility':0.10,'sharpe_ratio':1.1}
    },
    {
        'profile_name': 'Aggressive Growth Seed',
        'status': 'COMPLETED',
        'config': {'algorithm':'VQE','target_risk':0.15},
        'weights': {'AAPL':0.20,'NVDA':0.18,'MSFT':0.12,'SPY':0.15,'BTC':0.10,'GLD':0.05},
        'metrics': {'expected_return':0.14,'expected_volatility':0.15,'sharpe_ratio':0.95}
    },
    {
        'profile_name': 'Defensive Income Seed',
        'status': 'COMPLETED',
        'config': {'algorithm':'Classical','target_risk':0.05},
        'weights': {'AGG':0.45,'BIL':0.20,'GLD':0.10,'SPY':0.10,'AAPL':0.05,'MSFT':0.05},
        'metrics': {'expected_return':0.05,'expected_volatility':0.04,'sharpe_ratio':1.25}
    },
    {
        'profile_name': 'Tactical Alternative Seed',
        'status': 'COMPLETED',
        'config': {'algorithm':'NSGA2','target_risk':0.12},
        'weights': {'AAPL':0.12,'MSFT':0.10,'SPY':0.18,'AGG':0.15,'GLD':0.12,'BTC':0.10},
        'metrics': {'expected_return':0.10,'expected_volatility':0.11,'sharpe_ratio':0.98}
    }
]

with app.app_context():
    # create tables if not exist
    db.create_all()
    # seed only if empty
    if OptimizationRun.query.first():
        print('DB already contains runs; skipping seeding.')
    else:
        for item in SAMPLE:
            run = OptimizationRun(
                profile_name=item['profile_name'],
                status=item['status'],
                config=item.get('config'),
                weights=item.get('weights'),
                metrics=item.get('metrics')
            )
            db.session.add(run)
        db.session.commit()
        print('Seeded sample optimization runs.')
