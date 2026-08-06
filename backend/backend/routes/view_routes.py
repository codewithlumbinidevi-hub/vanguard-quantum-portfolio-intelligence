from flask import Blueprint, render_template, request
from backend.models import OptimizationRun

view_bp = Blueprint('view', __name__)


@view_bp.route('/')
def home():
    return render_template('index.html')


@view_bp.route('/dashboard')
def dashboard():
    runs = OptimizationRun.query.order_by(OptimizationRun.created_at.desc()).all()
    return render_template('dashboard.html', runs=runs)


@view_bp.route('/portfolio')
def portfolio():
    runs = OptimizationRun.query.order_by(OptimizationRun.created_at.desc()).all()
    return render_template('portfolio.html', runs=runs)


@view_bp.route('/portfolio/<int:run_id>')
def portfolio_details(run_id):
    run = OptimizationRun.query.get_or_404(run_id)
    return render_template('portfolio_details.html', run=run)


@view_bp.route('/optimization')
def optimization():
    return render_template('optimization.html')


@view_bp.route('/results')
def results():
    return render_template('results.html')


@view_bp.route('/analytics')
def analytics():
    return render_template('analytics.html')


@view_bp.route('/reports')
def reports():
    return render_template('reports.html')


@view_bp.route('/profile')
def profile():
    return render_template('profile.html')


@view_bp.route('/notifications')
def notifications():
    return render_template('notifications.html')


@view_bp.route('/about')
def about():
    return render_template('about.html')
