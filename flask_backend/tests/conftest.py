"""
Shared pytest fixtures for the InSync Flask test suite.
Uses TestingConfig → in-memory SQLite → no external DB needed.
"""
import io
import base64
import pytest
from app import create_app, db as _db
from app.config import TestingConfig
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest


# ── Minimal 1×1 PNG in bytes (valid image for upload tests) ──────────────────
def _tiny_png() -> bytes:
    import struct, zlib
    def chunk(name, data):
        c = struct.pack('>I', len(data)) + name + data
        return c + struct.pack('>I', zlib.crc32(name + data) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0)
    idat = zlib.compress(b'\x00\xff\x00\x00')
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

TINY_PNG = _tiny_png()
TINY_PNG_B64 = f"data:image/png;base64,{base64.b64encode(TINY_PNG).decode()}"


@pytest.fixture(scope='session')
def app():
    """Create Flask application configured for testing (in-memory SQLite)."""
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Test client. Each test gets a clean database."""
    with app.app_context():
        # Rollback any pending transaction from a previous failed test
        try:
            _db.session.rollback()
        except Exception:
            pass
        # Clear all tables before each test
        for table in reversed(_db.metadata.sorted_tables):
            try:
                _db.session.execute(table.delete())
            except Exception:
                _db.session.rollback()
                _db.session.execute(table.delete())
        _db.session.commit()
    return app.test_client()


@pytest.fixture(scope='function')
def db(app):
    """Database session for direct model access in tests."""
    with app.app_context():
        yield _db


# ── Helper factories ─────────────────────────────────────────────────────────

def make_sponsor(client, email='sponsor@test.com', password='pass1234',
                 name='Test Sponsor', company='TestCo', industry='Tech', budget=50000):
    """Register + login a sponsor and return (user_dict, token)."""
    r = client.post('/api/auth/register', json={
        'name': name, 'email': email, 'password': password,
        'role': 'sponsor', 'company': company, 'industry': industry, 'budget': budget,
    })
    assert r.status_code == 201, r.get_json()
    r2 = client.post('/api/auth/login', json={'email': email, 'password': password})
    data = r2.get_json()
    return data['user'], data['token']


def make_influencer(client, email='inf@test.com', password='pass1234',
                    name='Test Inf', category='Tech', niche='AI', reach=10000):
    """Register + login an influencer and return (user_dict, token)."""
    r = client.post('/api/auth/register', json={
        'name': name, 'email': email, 'password': password,
        'role': 'influencer', 'category': category, 'niche': niche, 'reach': reach,
    })
    assert r.status_code == 201, r.get_json()
    r2 = client.post('/api/auth/login', json={'email': email, 'password': password})
    data = r2.get_json()
    return data['user'], data['token']


def make_admin(client, email='admin@test.com', password='admin1234', app_ctx=None):
    """Create admin user directly in DB and return token."""
    from flask import current_app
    with client.application.app_context():
        user = User(name='Admin', email=email, role='admin')
        user.set_password(password)
        _db.session.add(user)
        _db.session.commit()
    r = client.post('/api/auth/login', json={'email': email, 'password': password})
    return r.get_json()['token']


def auth_header(token):
    return {'Authorization': f'Bearer {token}'}


def make_campaign(client, token, title='Test Campaign', budget=10000,
                  category='Tech', is_public=True):
    """Create a campaign and return its dict."""
    r = client.post('/api/campaign/', json={
        'title': title, 'budget': budget, 'category': category, 'isPublic': is_public,
    }, headers=auth_header(token))
    assert r.status_code == 201, r.get_json()
    return r.get_json()
