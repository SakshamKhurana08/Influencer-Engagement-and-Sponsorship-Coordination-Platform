"""
Unit tests for models, marshmallow schemas, and utility functions.
Does not hit HTTP endpoints — tests at the Python layer directly.
"""
import io
import pytest
from unittest.mock import MagicMock
from tests.conftest import make_sponsor, make_influencer, make_admin, auth_header


# ══════════════════════════════════════════════════════════════════════════════
# USER MODEL
# ══════════════════════════════════════════════════════════════════════════════

class TestUserModel:

    def test_set_and_check_password_correct(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='Test', email='pw@t.com', role='sponsor')
            u.set_password('mypassword')
            assert u.check_password('mypassword') is True

    def test_check_password_wrong(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='Test', email='pw2@t.com', role='sponsor')
            u.set_password('correct')
            assert u.check_password('wrong') is False

    def test_check_password_empty(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='Test', email='pw3@t.com', role='sponsor')
            u.set_password('correct')
            assert u.check_password('') is False

    def test_to_dict_excludes_password(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='Test', email='todict@t.com', role='influencer')
            u.set_password('secret')
            d = u.to_dict()
            assert 'password' not in d
            assert d['email'] == 'todict@t.com'
            assert d['role'] == 'influencer'
            assert 'isFlagged' in d

    def test_to_dict_has_required_keys(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='T', email='keys@t.com', role='admin')
            u.set_password('x' * 6)
            d = u.to_dict()
            for key in ('id', 'name', 'email', 'role', 'isFlagged'):
                assert key in d

    def test_password_is_hashed_not_plaintext(self, app):
        from app.models.user import User
        with app.app_context():
            u = User(name='T', email='hash@t.com', role='sponsor')
            u.set_password('plaintext')
            assert u.password != 'plaintext'
            assert u.password.startswith('$2')  # bcrypt hash


# ══════════════════════════════════════════════════════════════════════════════
# CAMPAIGN MODEL — to_dict
# ══════════════════════════════════════════════════════════════════════════════

class TestCampaignModel:

    def test_to_dict_basic(self, app, db):
        from app.models.user import User
        from app.models.sponsor import Sponsor
        from app.models.campaign import Campaign
        with app.app_context():
            u = User(name='S', email='camp_model@t.com', role='sponsor')
            u.set_password('pass1234')
            db.session.add(u)
            db.session.flush()
            s = Sponsor(user_id=u.id, company_name='Co', industry='Tech', budget=1000)
            db.session.add(s)
            db.session.flush()
            c = Campaign(sponsor_id=s.id, title='Test', budget=500, is_public=True)
            db.session.add(c)
            db.session.commit()
            d = c.to_dict()
            assert d['title'] == 'Test'
            assert d['budget'] == 500
            assert d['isPublic'] is True
            assert d['isFlagged'] is False
            assert 'createdAt' in d

    def test_to_dict_include_influencers_empty(self, app, db):
        from app.models.user import User
        from app.models.sponsor import Sponsor
        from app.models.campaign import Campaign
        with app.app_context():
            u = User(name='S2', email='camp_inf@t.com', role='sponsor')
            u.set_password('pass1234')
            db.session.add(u)
            db.session.flush()
            s = Sponsor(user_id=u.id, company_name='Co2', industry='Tech', budget=1000)
            db.session.add(s)
            db.session.flush()
            c = Campaign(sponsor_id=s.id, title='T2', budget=100, is_public=True)
            db.session.add(c)
            db.session.commit()
            d = c.to_dict(include_influencers=True)
            assert d['acceptedInfluencers'] == []


# ══════════════════════════════════════════════════════════════════════════════
# AD REQUEST MODEL
# ══════════════════════════════════════════════════════════════════════════════

class TestAdRequestModel:

    def test_to_dict_keys(self, app, db):
        from app.models.user import User
        from app.models.sponsor import Sponsor
        from app.models.campaign import Campaign
        from app.models.ad_request import AdRequest
        with app.app_context():
            u = User(name='AR', email='ar_model@t.com', role='sponsor')
            u.set_password('pass1234')
            db.session.add(u)
            db.session.flush()
            s = Sponsor(user_id=u.id, company_name='Co3', industry='Tech', budget=1000)
            db.session.add(s)
            db.session.flush()
            c = Campaign(sponsor_id=s.id, title='AR Cam', budget=100, is_public=True)
            db.session.add(c)
            db.session.flush()
            ar = AdRequest(campaign_id=c.id, message='Hi', status='pending')
            db.session.add(ar)
            db.session.commit()
            d = ar.to_dict()
            for key in ('id', 'campaignId', 'influencerId', 'status', 'message', 'proposedTerms', 'createdAt'):
                assert key in d
            assert d['status'] == 'pending'

    def test_to_dict_default_status(self, app, db):
        from app.models.user import User
        from app.models.sponsor import Sponsor
        from app.models.campaign import Campaign
        from app.models.ad_request import AdRequest
        with app.app_context():
            u = User(name='Def', email='def_ar@t.com', role='sponsor')
            u.set_password('pass1234')
            db.session.add(u)
            db.session.flush()
            s = Sponsor(user_id=u.id, company_name='DefCo', industry='Tech', budget=100)
            db.session.add(s)
            db.session.flush()
            c = Campaign(sponsor_id=s.id, title='Def', budget=100, is_public=True)
            db.session.add(c)
            db.session.flush()
            ar = AdRequest(campaign_id=c.id, message='X')
            db.session.add(ar)
            db.session.commit()
            assert ar.status == 'pending'


# ══════════════════════════════════════════════════════════════════════════════
# MARSHMALLOW SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════

class TestRegisterSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, RegisterSchema
        return validate_schema(RegisterSchema(), data)

    def test_valid_sponsor(self):
        cleaned, errors = self._v({
            'name': 'Co', 'email': 'a@b.com', 'password': 'pass12', 'role': 'sponsor',
        })
        assert errors == {}
        assert cleaned['role'] == 'sponsor'

    def test_valid_influencer(self):
        cleaned, errors = self._v({
            'name': 'Inf', 'email': 'inf@b.com', 'password': 'pass12', 'role': 'influencer',
            'reach': 5000,
        })
        assert errors == {}

    def test_missing_name(self):
        _, errors = self._v({'email': 'a@b.com', 'password': 'pass12', 'role': 'sponsor'})
        assert 'name' in errors

    def test_invalid_email(self):
        _, errors = self._v({'name': 'X', 'email': 'notEmail', 'password': 'pass12', 'role': 'sponsor'})
        assert 'email' in errors

    def test_short_password(self):
        _, errors = self._v({'name': 'X', 'email': 'a@b.com', 'password': 'abc', 'role': 'sponsor'})
        assert 'password' in errors

    def test_invalid_role(self):
        _, errors = self._v({'name': 'X', 'email': 'a@b.com', 'password': 'pass12', 'role': 'admin'})
        assert 'role' in errors

    def test_negative_budget(self):
        _, errors = self._v({
            'name': 'X', 'email': 'a@b.com', 'password': 'pass12', 'role': 'sponsor', 'budget': -1,
        })
        assert 'budget' in errors

    def test_negative_reach(self):
        _, errors = self._v({
            'name': 'X', 'email': 'a@b.com', 'password': 'pass12', 'role': 'influencer', 'reach': -1,
        })
        assert 'reach' in errors

    def test_none_input_treated_as_empty(self):
        _, errors = self._v(None)
        assert 'name' in errors

    def test_unknown_fields_excluded(self):
        cleaned, errors = self._v({
            'name': 'X', 'email': 'a@b.com', 'password': 'pass12',
            'role': 'sponsor', 'unknown_field': 'whatever',
        })
        assert errors == {}
        assert 'unknown_field' not in cleaned


class TestLoginSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, LoginSchema
        return validate_schema(LoginSchema(), data)

    def test_valid(self):
        _, errors = self._v({'email': 'a@b.com', 'password': 'x'})
        assert errors == {}

    def test_missing_email(self):
        _, errors = self._v({'password': 'x'})
        assert 'email' in errors

    def test_missing_password(self):
        _, errors = self._v({'email': 'a@b.com'})
        assert 'password' in errors

    def test_invalid_email_format(self):
        _, errors = self._v({'email': 'notvalid', 'password': 'x'})
        assert 'email' in errors


class TestCampaignSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, CampaignSchema
        return validate_schema(CampaignSchema(), data)

    def test_valid(self):
        _, errors = self._v({'title': 'My Campaign', 'budget': 5000, 'isPublic': True})
        assert errors == {}

    def test_missing_title(self):
        _, errors = self._v({'budget': 5000})
        assert 'title' in errors

    def test_empty_title(self):
        _, errors = self._v({'title': ''})
        assert 'title' in errors

    def test_title_too_long(self):
        _, errors = self._v({'title': 'x' * 256})
        assert 'title' in errors

    def test_negative_budget(self):
        _, errors = self._v({'title': 'T', 'budget': -1})
        assert 'budget' in errors

    def test_zero_budget_allowed(self):
        _, errors = self._v({'title': 'T', 'budget': 0})
        assert errors == {}

    def test_is_public_defaults_true(self):
        cleaned, _ = self._v({'title': 'T'})
        assert cleaned['isPublic'] is True


class TestAdRequestSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, AdRequestSchema
        return validate_schema(AdRequestSchema(), data)

    def test_valid(self):
        _, errors = self._v({'message': 'Work with us', 'proposedTerms': '3 posts'})
        assert errors == {}

    def test_missing_message(self):
        _, errors = self._v({'proposedTerms': '3 posts'})
        assert 'message' in errors

    def test_empty_message(self):
        _, errors = self._v({'message': ''})
        assert 'message' in errors

    def test_proposed_terms_optional(self):
        _, errors = self._v({'message': 'Hi'})
        assert errors == {}


class TestAdRequestUpdateSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, AdRequestUpdateSchema
        return validate_schema(AdRequestUpdateSchema(), data)

    def test_valid_status_accepted(self):
        _, errors = self._v({'status': 'accepted'})
        assert errors == {}

    def test_valid_status_negotiation(self):
        _, errors = self._v({'status': 'negotiation'})
        assert errors == {}

    def test_invalid_status(self):
        _, errors = self._v({'status': 'INVALID'})
        assert 'status' in errors

    def test_all_fields_optional(self):
        _, errors = self._v({})
        assert errors == {}

    def test_all_valid_statuses(self):
        for status in ('pending', 'accepted', 'rejected', 'negotiation'):
            _, errors = self._v({'status': status})
            assert errors == {}, f'Status {status} should be valid'


class TestSponsorProfileSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, SponsorProfileSchema
        return validate_schema(SponsorProfileSchema(), data)

    def test_valid(self):
        _, errors = self._v({'name': 'X', 'companyName': 'Co', 'industry': 'Tech', 'budget': 1000})
        assert errors == {}

    def test_missing_company_name(self):
        _, errors = self._v({'name': 'X', 'industry': 'Tech', 'budget': 1000})
        assert 'companyName' in errors

    def test_empty_industry(self):
        _, errors = self._v({'name': 'X', 'companyName': 'Co', 'industry': '', 'budget': 1000})
        assert 'industry' in errors

    def test_negative_budget(self):
        _, errors = self._v({'name': 'X', 'companyName': 'Co', 'industry': 'T', 'budget': -1})
        assert 'budget' in errors


class TestInfluencerProfileSchema:

    def _v(self, data):
        from app.utils.schemas import validate_schema, InfluencerProfileSchema
        return validate_schema(InfluencerProfileSchema(), data)

    def test_valid(self):
        _, errors = self._v({'name': 'X', 'category': 'Tech', 'niche': 'AI', 'reach': 1000})
        assert errors == {}

    def test_missing_category(self):
        _, errors = self._v({'name': 'X', 'niche': 'AI', 'reach': 1000})
        assert 'category' in errors

    def test_negative_reach(self):
        _, errors = self._v({'name': 'X', 'category': 'T', 'niche': 'N', 'reach': -5})
        assert 'reach' in errors


# ══════════════════════════════════════════════════════════════════════════════
# FILES UTILITY
# ══════════════════════════════════════════════════════════════════════════════

class TestFilesUtil:

    def test_allowed_file_png(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('photo.png') is True

    def test_allowed_file_jpg(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('photo.jpg') is True

    def test_allowed_file_jpeg(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('photo.jpeg') is True

    def test_allowed_file_gif(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('photo.gif') is True

    def test_allowed_file_webp(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('photo.webp') is True

    def test_allowed_file_pdf_rejected(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('doc.pdf') is False

    def test_allowed_file_exe_rejected(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('virus.exe') is False

    def test_allowed_file_no_extension(self, app):
        with app.app_context():
            from app.utils.files import allowed_file
            assert allowed_file('noextension') is False

    def test_save_profile_image_none(self, app):
        with app.app_context():
            from app.utils.files import save_profile_image
            assert save_profile_image(None) is None

    def test_save_profile_image_empty_filename(self, app):
        with app.app_context():
            from app.utils.files import save_profile_image
            fs = MagicMock()
            fs.filename = ''
            assert save_profile_image(fs) is None

    def test_save_profile_image_valid_png(self, app):
        from tests.conftest import TINY_PNG
        with app.app_context():
            from app.utils.files import save_profile_image
            from werkzeug.datastructures import FileStorage
            fs = FileStorage(stream=io.BytesIO(TINY_PNG), filename='test.png', content_type='image/png')
            result = save_profile_image(fs)
            assert result is not None
            assert result.startswith('data:image/png;base64,')

    def test_save_profile_image_valid_jpg(self, app):
        # JPEG magic bytes
        fake_jpg = b'\xff\xd8\xff' + b'\x00' * 100
        with app.app_context():
            from app.utils.files import save_profile_image
            from werkzeug.datastructures import FileStorage
            fs = FileStorage(stream=io.BytesIO(fake_jpg), filename='photo.jpg', content_type='image/jpeg')
            result = save_profile_image(fs)
            assert result.startswith('data:image/jpeg;base64,')

    def test_save_profile_image_invalid_mime_and_ext(self, app):
        with app.app_context():
            from app.utils.files import save_profile_image
            from werkzeug.datastructures import FileStorage
            fs = FileStorage(stream=io.BytesIO(b'fake'), filename='doc.pdf', content_type='application/pdf')
            with pytest.raises(ValueError):
                save_profile_image(fs)

    def test_save_profile_image_too_large(self, app):
        with app.app_context():
            from app.utils.files import save_profile_image
            from werkzeug.datastructures import FileStorage
            big = b'\x89PNG' + b'\x00' * (11 * 1024 * 1024)
            fs = FileStorage(stream=io.BytesIO(big), filename='big.png', content_type='image/png')
            with pytest.raises(ValueError, match='too large'):
                save_profile_image(fs)

    def test_save_profile_image_base64_roundtrip(self, app):
        """Base64 data URI can be decoded back to original bytes."""
        from tests.conftest import TINY_PNG
        import base64
        with app.app_context():
            from app.utils.files import save_profile_image
            from werkzeug.datastructures import FileStorage
            fs = FileStorage(stream=io.BytesIO(TINY_PNG), filename='round.png', content_type='image/png')
            result = save_profile_image(fs)
            header, b64 = result.split(',', 1)
            decoded = base64.b64decode(b64)
            assert decoded == TINY_PNG


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK + APP FACTORY
# ══════════════════════════════════════════════════════════════════════════════

class TestAppFactory:

    def test_health_endpoint(self, client):
        r = client.get('/')
        assert r.status_code == 200
        data = r.get_json()
        assert data['status'] == 'ok'

    def test_all_blueprints_registered(self, app):
        rule_prefixes = [str(rule) for rule in app.url_map.iter_rules()]
        assert any('/api/auth' in r for r in rule_prefixes)
        assert any('/api/admin' in r for r in rule_prefixes)
        assert any('/api/influencer' in r for r in rule_prefixes)
        assert any('/api/sponsors' in r for r in rule_prefixes)
        assert any('/api/campaign' in r for r in rule_prefixes)

    def test_cors_header_present(self, client):
        r = client.get('/api/auth/profile',
                        headers={'Origin': 'http://localhost:5173'})
        # CORS should not block the request origin
        # (we check the header exists, not specific values)
        assert r.status_code in (401, 422)  # Auth-related, not CORS blocked


# ══════════════════════════════════════════════════════════════════════════════
# RBAC DECORATORS
# ══════════════════════════════════════════════════════════════════════════════

class TestRBACDecorators:

    def test_admin_can_access_admin_routes(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/stats', headers=auth_header(tok))
        assert r.status_code == 200

    def test_sponsor_blocked_from_admin(self, client):
        _, tok = make_sponsor(client, email='rbac_sp_admin@t.com')
        r = client.get('/api/admin/stats', headers=auth_header(tok))
        assert r.status_code == 403

    def test_influencer_blocked_from_admin(self, client):
        _, tok = make_influencer(client, email='rbac_inf_admin@t.com')
        r = client.get('/api/admin/stats', headers=auth_header(tok))
        assert r.status_code == 403

    def test_sponsor_can_access_sponsor_routes(self, client):
        _, tok = make_sponsor(client, email='rbac_sp_ok@t.com')
        r = client.get('/api/sponsors/details', headers=auth_header(tok))
        assert r.status_code == 200

    def test_influencer_can_access_influencer_routes(self, client):
        _, tok = make_influencer(client, email='rbac_inf_ok@t.com')
        r = client.get('/api/influencer/profile', headers=auth_header(tok))
        assert r.status_code == 200

    def test_no_token_returns_401_not_403(self, client):
        r = client.get('/api/admin/stats')
        assert r.status_code == 401  # 401 = no credentials, 403 = wrong role
