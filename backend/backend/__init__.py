from backend.config import Config
from backend.db import init_db
from flask_cors import CORS


def create_app():
    from flask import Flask
    app = Flask(__name__, static_folder='static', template_folder='templates', static_url_path='/static')
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "*"]}}, supports_credentials=True)
    init_db(app)

    from backend.routes.api_routes import api_bp
    from backend.routes.view_routes import view_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(view_bp)

    return app
