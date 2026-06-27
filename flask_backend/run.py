"""
Application entry point.

Development:
    python run.py

Production (gunicorn):
    gunicorn -w 4 -b 0.0.0.0:5000 "run:app"

Flask-Migrate:
    flask db init
    flask db migrate -m "initial"
    flask db upgrade

Seed admin user:
    flask seed-admin
"""
import os
from dotenv import load_dotenv

# Load .env before anything else so config picks it up
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app import create_app, db
from app.models import *   # noqa: F401, F403 — ensures all models are imported for Flask-Migrate

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'

    with app.app_context():
        # Auto-create tables on first run (dev convenience).
        # In production, use: flask db upgrade
        db.create_all()

    print(f'🚀 InSync Flask API starting on http://0.0.0.0:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)
