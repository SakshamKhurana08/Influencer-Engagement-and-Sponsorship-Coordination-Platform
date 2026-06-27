"""
Application configuration.

Priority:
  1. Environment variables (via .env loaded by run.py)
  2. Defaults defined here

Database fallback logic:
  - If DATABASE_URL starts with 'postgresql' → use PostgreSQL (psycopg2)
  - Otherwise → fall back to SQLite for local / test environments
"""
import os


class BaseConfig:
    # ── Core ──────────────────────────────────────────────────────────────────
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me')
    DEBUG = False
    TESTING = False

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'change-me-jwt')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour (seconds)

    # ── Database ──────────────────────────────────────────────────────────────
    _db_url = os.environ.get('DATABASE_URL', '')

    if _db_url.startswith('postgresql') or _db_url.startswith('postgres://'):
        # Heroku / Railway sometimes use postgres:// which SQLAlchemy 2.x rejects
        SQLALCHEMY_DATABASE_URI = _db_url.replace('postgres://', 'postgresql://', 1)
    else:
        # SQLite fallback — safe for local development and Docker-free testing
        _base_dir = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = (
            _db_url or f"sqlite:///{os.path.join(_base_dir, '..', 'influencer_dev.db')}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,   # reconnect on stale connections
        'pool_recycle': 300,     # recycle connections every 5 min
    }

    # ── File uploads ─────────────────────────────────────────────────────────
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads/influencer_photos')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # ── Executor (Flask-Executor — threading backend) ─────────────────────────
    EXECUTOR_TYPE = 'thread'
    EXECUTOR_MAX_WORKERS = 4
    EXECUTOR_PROPAGATE_EXCEPTIONS = True

    # ── Admin seed ────────────────────────────────────────────────────────────
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@insync.dev')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@1234')


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class ProductionConfig(BaseConfig):
    DEBUG = False


class TestingConfig(BaseConfig):
    TESTING = True
    # Always use SQLite for tests (fast, no external dep)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = 60


_ENV_MAP = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}


def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return _ENV_MAP.get(env, DevelopmentConfig)
