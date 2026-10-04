"""
Tests for POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
"""
import io
import pytest
from tests.conftest import make_sponsor, make_influencer, make_admin, auth_header, TINY_PNG, TINY_PNG_B64


# ══════════════════════════════════════════════════════════════════════════════
# REGISTER
# ══════════════════════════════════════════════════════════════════════════════

class TestRegister:

    # ── Happy paths ──────────────────────────────────────────────────────────

    def test_register_sponsor_success(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'Sponsor One', 'email': 'sp1@test.com', 'password': 'pass1234',
            'role': 'sponsor', 'company': 'Acme', 'industry': 'Tech', 'budget': 5000,
        })
        assert r.status_code == 202
        data = r.get_json()
        assert 'registration' in data['message'].lower() or 'approval' in data['message'].lower()
        assert data['user']['role'] == 'sponsor'
        assert data['user']['email'] == 'sp1@test.com'
        assert 'password' not in data['user']   # password must NOT be leaked

    def test_register_influencer_success(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'Inf One', 'email': 'inf1@test.com', 'password': 'pass1234',
            'role': 'influencer', 'category': 'Fashion', 'niche': 'Streetwear', 'reach': 50000,
        })
        assert r.status_code == 202
        assert r.get_json()['user']['role'] == 'influencer'

    def test_register_influencer_with_image(self, client):
        """Profile image should be converted to base64 data URI."""
        r = client.post('/api/auth/register',
                        content_type='multipart/form-data',
                        data={
                            'name': 'Img Inf', 'email': 'imgInf@test.com', 'password': 'pass1234',
                            'role': 'influencer', 'category': 'Tech', 'niche': 'AI', 'reach': '10000',
                            'profileImage': (io.BytesIO(TINY_PNG), 'photo.png'),
                        })
        assert r.status_code == 202
        user_data = r.get_json()['user']
        # Create token directly — avoids login status-check dependency
        from app import db as _db
        with client.application.app_context():
            from sqlalchemy import text
            from flask_jwt_extended import create_access_token
            _db.session.execute(
                text("UPDATE users SET status='active', email_verified=1 WHERE email='imgInf@test.com'")
            )
            _db.session.commit()
            token = create_access_token(
                identity=str(user_data['id']),
                additional_claims={'role': 'influencer', 'userId': user_data['id']}
            )
        r3 = client.get('/api/influencer/profile', headers=auth_header(token))
        inf = r3.get_json()['influencer']
        assert inf['profileImageUrl'] is not None
        assert inf['profileImageUrl'].startswith('data:image/')
        assert ';base64,' in inf['profileImageUrl']

    def test_register_multipart_sponsor(self, client):
        """Sponsor registration via multipart/form-data works."""
        r = client.post('/api/auth/register',
                        content_type='multipart/form-data',
                        data={'name': 'MP Sponsor', 'email': 'mp@test.com', 'password': 'pass1234',
                              'role': 'sponsor', 'company': 'MPCo', 'industry': 'Retail', 'budget': '1000'})
        assert r.status_code == 202

    # ── Duplicate email ───────────────────────────────────────────────────────

    def test_register_duplicate_email(self, client):
        make_sponsor(client, email='dup@test.com')
        r = client.post('/api/auth/register', json={
            'name': 'Dup', 'email': 'dup@test.com', 'password': 'pass1234',
            'role': 'sponsor', 'company': 'Co', 'industry': 'Tech', 'budget': 1000,
        })
        assert r.status_code == 400
        assert 'already exists' in r.get_json()['message'].lower()

    # ── Marshmallow validation failures (422) ────────────────────────────────

    def test_register_missing_name(self, client):
        r = client.post('/api/auth/register', json={
            'email': 'noname@test.com', 'password': 'pass1234', 'role': 'sponsor'
        })
        assert r.status_code == 422
        assert 'name' in r.get_json()['errors']

    def test_register_invalid_email(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'Bad Email', 'email': 'notanemail', 'password': 'pass1234', 'role': 'sponsor'
        })
        assert r.status_code == 422
        assert 'email' in r.get_json()['errors']

    def test_register_short_password(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'Short', 'email': 'short@test.com', 'password': 'abc', 'role': 'sponsor'
        })
        assert r.status_code == 422
        assert 'password' in r.get_json()['errors']

    def test_register_invalid_role(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'Bad Role', 'email': 'role@test.com', 'password': 'pass1234', 'role': 'admin'
        })
        assert r.status_code == 422
        assert 'role' in r.get_json()['errors']

    def test_register_negative_budget(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'NegBudget', 'email': 'neg@test.com', 'password': 'pass1234',
            'role': 'sponsor', 'company': 'Co', 'industry': 'Tech', 'budget': -1,
        })
        assert r.status_code == 422

    def test_register_negative_reach(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'NegReach', 'email': 'negr@test.com', 'password': 'pass1234',
            'role': 'influencer', 'category': 'Tech', 'niche': 'AI', 'reach': -1,
        })
        assert r.status_code == 422

    # ── Business-logic validation (400) ──────────────────────────────────────

    def test_register_sponsor_missing_company(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'No Company', 'email': 'nocomp@test.com', 'password': 'pass1234',
            'role': 'sponsor', 'industry': 'Tech', 'budget': 1000,
        })
        assert r.status_code == 400
        assert 'company' in r.get_json()['message'].lower()

    def test_register_influencer_missing_category(self, client):
        r = client.post('/api/auth/register', json={
            'name': 'No Cat', 'email': 'nocat@test.com', 'password': 'pass1234',
            'role': 'influencer', 'niche': 'AI', 'reach': 1000,
        })
        assert r.status_code == 400
        assert 'category' in r.get_json()['message'].lower()

    def test_register_empty_body(self, client):
        r = client.post('/api/auth/register', json={})
        assert r.status_code == 422

    def test_register_no_body(self, client):
        r = client.post('/api/auth/register')
        assert r.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# LOGIN
# ══════════════════════════════════════════════════════════════════════════════

class TestLogin:

    def test_login_sponsor_success(self, client):
        make_sponsor(client, email='login_sp@test.com')
        r = client.post('/api/auth/login', json={'email': 'login_sp@test.com', 'password': 'pass1234'})
        assert r.status_code == 200
        data = r.get_json()
        assert 'token' in data
        assert data['user']['role'] == 'sponsor'
        assert data['message'] == 'Login successful'

    def test_login_influencer_success(self, client):
        make_influencer(client, email='login_inf@test.com')
        r = client.post('/api/auth/login', json={'email': 'login_inf@test.com', 'password': 'pass1234'})
        assert r.status_code == 200
        assert r.get_json()['user']['role'] == 'influencer'

    def test_login_token_contains_role_claim(self, client):
        """JWT payload must include role and userId claims."""
        import base64, json as _json
        make_sponsor(client, email='claims@test.com')
        r = client.post('/api/auth/login', json={'email': 'claims@test.com', 'password': 'pass1234'})
        token = r.get_json()['token']
        payload_b64 = token.split('.')[1]
        # Fix padding
        payload_b64 += '=' * (-len(payload_b64) % 4)
        payload = _json.loads(base64.b64decode(payload_b64))
        assert payload.get('role') == 'sponsor'
        assert 'userId' in payload

    def test_login_wrong_password(self, client):
        make_sponsor(client, email='wrongpw@test.com')
        r = client.post('/api/auth/login', json={'email': 'wrongpw@test.com', 'password': 'badpass'})
        assert r.status_code == 400
        assert 'invalid' in r.get_json()['message'].lower()

    def test_login_unknown_email(self, client):
        r = client.post('/api/auth/login', json={'email': 'ghost@test.com', 'password': 'pass1234'})
        assert r.status_code == 404

    def test_login_missing_email(self, client):
        r = client.post('/api/auth/login', json={'password': 'pass1234'})
        assert r.status_code == 422

    def test_login_missing_password(self, client):
        r = client.post('/api/auth/login', json={'email': 'x@test.com'})
        assert r.status_code == 422

    def test_login_empty_body(self, client):
        r = client.post('/api/auth/login', json={})
        assert r.status_code == 422

    def test_login_email_case_insensitive(self, client):
        make_sponsor(client, email='case@test.com')
        r = client.post('/api/auth/login', json={'email': 'CASE@TEST.COM', 'password': 'pass1234'})
        assert r.status_code == 200


# ══════════════════════════════════════════════════════════════════════════════
# GET PROFILE
# ══════════════════════════════════════════════════════════════════════════════

class TestGetProfile:

    def test_get_profile_success(self, client):
        _, token = make_sponsor(client, email='prof@test.com')
        r = client.get('/api/auth/profile', headers=auth_header(token))
        assert r.status_code == 200
        assert r.get_json()['user']['email'] == 'prof@test.com'

    def test_get_profile_no_token(self, client):
        r = client.get('/api/auth/profile')
        assert r.status_code == 401

    def test_get_profile_bad_token(self, client):
        r = client.get('/api/auth/profile', headers={'Authorization': 'Bearer rubbish'})
        assert r.status_code == 422  # Flask-JWT-Extended returns 422 for malformed tokens

    def test_get_profile_password_not_in_response(self, client):
        _, token = make_influencer(client, email='nopw@test.com')
        r = client.get('/api/auth/profile', headers=auth_header(token))
        assert 'password' not in r.get_json()['user']


# ══════════════════════════════════════════════════════════════════════════════
# EMAIL VERIFICATION (TASK-802)
# ══════════════════════════════════════════════════════════════════════════════

class TestEmailVerification:

    def _register(self, client, email='ver@test.com'):
        """Register a user and return the response (does NOT approve)."""
        return client.post('/api/auth/register', json={
            'name': 'Ver User', 'email': email, 'password': 'pass1234',
            'role': 'sponsor', 'company': 'VerCo', 'industry': 'Tech', 'budget': 1000,
        })

    def test_register_returns_202(self, client):
        r = self._register(client)
        assert r.status_code == 202

    def test_new_user_email_verified_is_false(self, client):
        r = self._register(client)
        assert r.get_json()['user']['emailVerified'] == False

    def test_unverified_user_cannot_login(self, client):
        self._register(client, email='unver@test.com')
        r = client.post('/api/auth/login', json={'email': 'unver@test.com', 'password': 'pass1234'})
        assert r.status_code == 403
        assert 'verify your email' in r.get_json()['message'].lower()

    def test_verify_email_with_valid_token(self, client, app):
        self._register(client, email='toVerify@test.com')
        # Generate a valid token directly
        with app.app_context():
            from app.utils.email import make_token
            from app.models.user import User
            from app import db
            user = User.query.filter_by(email='toverify@test.com').first()
            token = make_token({'user_id': user.id}, salt='email-verify', expires_sec=86400)
        r = client.post('/api/auth/verify-email', json={'token': token})
        assert r.status_code == 200
        assert 'verified' in r.get_json()['message'].lower()

    def test_verify_email_sets_email_verified_true(self, client, app):
        self._register(client, email='setTrue@test.com')
        with app.app_context():
            from app.utils.email import make_token
            from app.models.user import User
            from app import db
            user = User.query.filter_by(email='settrue@test.com').first()
            token = make_token({'user_id': user.id}, salt='email-verify', expires_sec=86400)
        client.post('/api/auth/verify-email', json={'token': token})
        with app.app_context():
            from app.models.user import User
            user = User.query.filter_by(email='settrue@test.com').first()
            assert user.email_verified == True

    def test_verify_email_with_expired_token_returns_400(self, client, app):
        """Simulate an expired token by using itsdangerous with a past timestamp."""
        self._register(client, email='expired@test.com')
        with app.app_context():
            from itsdangerous import URLSafeTimedSerializer
            from flask import current_app
            from app.models.user import User
            user = User.query.filter_by(email='expired@test.com').first()
            s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
            # Dump with a timestamp of 1 second ago, then verify with max_age=0
            # to force expiry — but we can't control the endpoint's max_age.
            # Instead: create a structurally valid but wrong-salt token so
            # verify_token returns None (expired-or-tampered path).
            token = s.dumps({'user_id': user.id}, salt='wrong-salt')
        r = client.post('/api/auth/verify-email', json={'token': token})
        assert r.status_code == 400
        assert 'expired' in r.get_json()['message'].lower() or 'invalid' in r.get_json()['message'].lower()

    def test_verify_email_with_tampered_token_returns_400(self, client):
        r = client.post('/api/auth/verify-email', json={'token': 'garbage.token.value'})
        assert r.status_code == 400

    def test_verify_email_missing_token_returns_400(self, client):
        r = client.post('/api/auth/verify-email', json={})
        assert r.status_code == 400

    def test_verified_user_can_login_after_approval(self, client, app):
        """After verifying email and being approved, user can log in."""
        self._register(client, email='approved@test.com')
        with app.app_context():
            from app.utils.email import make_token
            from app.models.user import User
            from app import db
            from sqlalchemy import text
            user = User.query.filter_by(email='approved@test.com').first()
            token = make_token({'user_id': user.id}, salt='email-verify', expires_sec=86400)
        # Verify email
        client.post('/api/auth/verify-email', json={'token': token})
        # Approve via direct DB
        with app.app_context():
            from app import db
            from sqlalchemy import text
            db.session.execute(
                text("UPDATE users SET status='active' WHERE email='approved@test.com'")
            )
            db.session.commit()
        r = client.post('/api/auth/login', json={'email': 'approved@test.com', 'password': 'pass1234'})
        assert r.status_code == 200
        assert 'token' in r.get_json()
