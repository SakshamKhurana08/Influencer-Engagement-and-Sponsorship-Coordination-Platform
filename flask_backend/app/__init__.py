"""
Flask application factory.
Initialises all extensions and registers blueprints.
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_executor import Executor
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ── Extension singletons ─────────────────────────────────────────────────────
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
executor = Executor()
cache = Cache()
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def create_app(config_object=None):
    """Create and configure the Flask application."""
    app = Flask(__name__, instance_relative_config=False)

    # ── Load configuration ────────────────────────────────────────────────────
    if config_object is None:
        from app.config import get_config
        config_object = get_config()
    app.config.from_object(config_object)

    # ── Production secret key guard ───────────────────────────────────────────
    if not app.config.get('TESTING'):
        if app.config.get('SECRET_KEY') in ('change-me', None, ''):
            raise RuntimeError(
                'SECRET_KEY is not set. Set a strong random value in your .env file.'
            )
        if app.config.get('JWT_SECRET_KEY') in ('change-me-jwt', None, ''):
            raise RuntimeError(
                'JWT_SECRET_KEY is not set. Set a strong random value in your .env file.'
            )

    # ── Ensure upload directory exists ────────────────────────────────────────
    upload_path = os.path.join(app.root_path, '..', app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_path, exist_ok=True)

    # ── Initialise extensions ─────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    executor.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)

    # ── CORS — restrict to configured origin in production ────────────────────
    allowed_origins = app.config.get('CORS_ORIGINS', '*')
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    # ── Register blueprints ───────────────────────────────────────────────────
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.influencer_routes import influencer_bp
    from app.routes.sponsor_routes import sponsor_bp
    from app.routes.campaign_routes import campaign_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(influencer_bp, url_prefix='/api/influencer')
    app.register_blueprint(sponsor_bp, url_prefix='/api/sponsors')
    app.register_blueprint(campaign_bp, url_prefix='/api/campaign')

    # ── Serve uploaded files ──────────────────────────────────────────────────
    from flask import send_from_directory

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_root = os.path.join(app.root_path, '..', app.config['UPLOAD_FOLDER'])
        return send_from_directory(os.path.abspath(upload_root), filename)

    @app.route('/')
    def health():
        return {'status': 'ok', 'message': 'InSync API is running'}, 200

    # ── Register CLI commands ─────────────────────────────────────────────────
    from app.commands import seed_admin, init_db
    app.cli.add_command(seed_admin)
    app.cli.add_command(init_db)

    return app


# ── Export limiter so routes can import it ────────────────────────────────────
__all__ = ['db', 'migrate', 'jwt', 'executor', 'cache', 'limiter', 'create_app']
