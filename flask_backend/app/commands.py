"""
Custom Flask CLI commands.

flask seed-admin   — create the admin user from .env credentials
flask init-db      — create all tables (use Flask-Migrate in production)
"""
import click
from flask.cli import with_appcontext

from app import db
from app.models.user import User


@click.command('seed-admin')
@with_appcontext
def seed_admin():
    """Create or update the admin user from environment config."""
    from flask import current_app
    email = current_app.config['ADMIN_EMAIL']
    password = current_app.config['ADMIN_PASSWORD']

    existing = User.query.filter_by(email=email).first()
    if existing:
        existing.set_password(password)
        existing.role = 'admin'
        db.session.commit()
        click.echo(f'✅ Admin user updated: {email}')
    else:
        admin = User(name='Admin', email=email, role='admin')
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        click.echo(f'✅ Admin user created: {email}')


@click.command('init-db')
@with_appcontext
def init_db():
    """Create all database tables. Use Flask-Migrate for production migrations."""
    db.create_all()
    click.echo('✅ All tables created.')
