import os
import sys
from dotenv import load_dotenv

load_dotenv()

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from src.api_runner import run_optimization_pipeline
except ImportError as exc:
    run_optimization_pipeline = None
    _import_error = exc


def optimize_portfolio_payload(payload):
    if run_optimization_pipeline is None:
        raise RuntimeError(f"Could not import optimization engine: {_import_error}")

    defaults = {
        'PROFILE_NAME': payload.get('profile_name', payload.get('PROFILE_NAME', 'Quantum Optimized Mandate')),
        'LAMBDA_RISK': float(payload.get('LAMBDA_RISK', payload.get('lambda', 5.0))),
        'MAX_TURNOVER': float(payload.get('MAX_TURNOVER', payload.get('max_turnover', 0.15))),
        'EQUITY_STRESS_CAP': float(payload.get('EQUITY_STRESS_CAP', payload.get('equity_stress_cap', 0.40))),
        'MIN_RETURN': float(payload.get('MIN_RETURN', payload.get('min_return', 0.07))),
        'P_return': float(payload.get('P_return', 10.0)),
        'bits': int(payload.get('bits', 6)),
        'max_weight': float(payload.get('max_weight', 0.25)),
        'MAX_SECTOR': float(payload.get('MAX_SECTOR', payload.get('max_sector', 0.40))),
        'P_budget': float(payload.get('P_budget', 25.0)),
        'P_sector': float(payload.get('P_sector', 25.0)),
        'P_turnover': float(payload.get('P_turnover', 15.0))
    }

    config = {
        **payload,
        **defaults
    }

    return run_optimization_pipeline(config)
