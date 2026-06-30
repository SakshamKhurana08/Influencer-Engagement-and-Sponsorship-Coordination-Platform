"""
Tests for /api/sponsors/* endpoints.
"""
import io
import pytest
from tests.conftest import make_sponsor, make_influencer, auth_header, TINY_PNG


class TestSponsorRBAC:

    PROTECTED = [
        ('GET', '/api/sponsors/details'),
        ('GET', '/api/sponsors/profile'),
        ('PUT', '/api/sponsors/profile'),
    ]

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_no_token_401(self, client, method, url):
        r = getattr(client, method.lower())(url)
        assert r.status_code == 401

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_influencer_token_403(self, client, method, url):
        _, tok = make_influencer(client, email=f'rbac_inf_{method}@t.com')
        r = getattr(client, method.lower())(url, headers=auth_header(tok))
        assert r.status_code == 403


class TestSponsorDetails:

    def test_get_details_success(self, client):
        _, tok = make_sponsor(client, email='det@t.com', company='DetCo', industry='Retail', budget=25000)
        r = client.get('/api/sponsors/details', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['companyName'] == 'DetCo'
        assert data['industry'] == 'Retail'
        assert data['budget'] == 25000

    def test_get_details_does_not_include_password(self, client):
        _, tok = make_sponsor(client, email='det_pw@t.com')
        r = client.get('/api/sponsors/details', headers=auth_header(tok))
        assert 'password' not in r.get_json()


class TestSponsorProfile:

    def test_get_profile_contains_user_and_sponsor(self, client):
        _, tok = make_sponsor(client, email='prof@t.com', name='Prof Sponsor')
        r = client.get('/api/sponsors/profile', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert 'sponsor' in data
        assert 'user' in data
        assert data['user']['name'] == 'Prof Sponsor'

    def test_update_profile_success(self, client):
        _, tok = make_sponsor(client, email='upd@t.com')
        r = client.put('/api/sponsors/profile', json={
            'name': 'New Name', 'companyName': 'NewCo',
            'industry': 'Finance', 'budget': 99999,
        }, headers=auth_header(tok))
        assert r.status_code == 200
        assert r.get_json()['sponsor']['companyName'] == 'NewCo'
        assert r.get_json()['user']['name'] == 'New Name'

    def test_update_profile_email_immutable(self, client):
        user, tok = make_sponsor(client, email='email_immut@t.com')
        original_email = user['email']
        r = client.put('/api/sponsors/profile', json={
            'name': 'X', 'companyName': 'Y', 'industry': 'Z', 'budget': 1,
            'email': 'hacker@evil.com',
        }, headers=auth_header(tok))
        assert r.status_code == 400
        assert 'email' in r.get_json()['message'].lower()

    def test_update_profile_missing_required_field(self, client):
        _, tok = make_sponsor(client, email='upd_miss@t.com')
        r = client.put('/api/sponsors/profile', json={
            'name': 'X', 'companyName': 'Y',  # missing industry and budget
        }, headers=auth_header(tok))
        assert r.status_code == 422

    def test_update_profile_empty_company_name(self, client):
        _, tok = make_sponsor(client, email='upd_empty@t.com')
        r = client.put('/api/sponsors/profile', json={
            'name': 'X', 'companyName': '', 'industry': 'Y', 'budget': 1,
        }, headers=auth_header(tok))
        assert r.status_code == 422

    def test_update_profile_negative_budget(self, client):
        _, tok = make_sponsor(client, email='upd_neg@t.com')
        r = client.put('/api/sponsors/profile', json={
            'name': 'X', 'companyName': 'Y', 'industry': 'Z', 'budget': -100,
        }, headers=auth_header(tok))
        assert r.status_code == 422

    def test_update_profile_budget_zero_allowed(self, client):
        _, tok = make_sponsor(client, email='upd_zero@t.com')
        r = client.put('/api/sponsors/profile', json={
            'name': 'X', 'companyName': 'Y', 'industry': 'Z', 'budget': 0,
        }, headers=auth_header(tok))
        assert r.status_code == 200


class TestSponsorImageUpload:

    def test_upload_image_success(self, client):
        _, tok = make_sponsor(client, email='img_sp@t.com')
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={'profileImage': (io.BytesIO(TINY_PNG), 'avatar.png')},
                        headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['sponsor']['profileImageUrl'] is not None
        assert data['sponsor']['profileImageUrl'].startswith('data:image/')

    def test_upload_image_missing_field(self, client):
        _, tok = make_sponsor(client, email='img_miss@t.com')
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={},
                        headers=auth_header(tok))
        assert r.status_code == 400
        assert 'profileImage' in r.get_json()['message']

    def test_upload_image_invalid_type(self, client):
        _, tok = make_sponsor(client, email='img_inv@t.com')
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={'profileImage': (io.BytesIO(b'fake pdf'), 'doc.pdf')},
                        headers=auth_header(tok))
        assert r.status_code == 400

    def test_upload_image_too_large(self, client):
        _, tok = make_sponsor(client, email='img_big@t.com')
        big = b'\x89PNG' + b'\x00' * (11 * 1024 * 1024)  # 11 MB
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={'profileImage': (io.BytesIO(big), 'big.png')},
                        headers=auth_header(tok))
        # Flask returns 413 when MAX_CONTENT_LENGTH is exceeded;
        # our own validator raises 400 — both indicate rejection.
        assert r.status_code in (400, 413)

    def test_upload_image_no_auth(self, client):
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={'profileImage': (io.BytesIO(TINY_PNG), 'avatar.png')})
        assert r.status_code == 401

    def test_upload_image_influencer_blocked(self, client):
        _, tok = make_influencer(client, email='img_inf@t.com')
        r = client.post('/api/sponsors/profile/image',
                        content_type='multipart/form-data',
                        data={'profileImage': (io.BytesIO(TINY_PNG), 'avatar.png')},
                        headers=auth_header(tok))
        assert r.status_code == 403

    def test_profile_shows_updated_image(self, client):
        """After upload, GET /api/sponsors/profile reflects the new image."""
        _, tok = make_sponsor(client, email='img_persist@t.com')
        client.post('/api/sponsors/profile/image',
                    content_type='multipart/form-data',
                    data={'profileImage': (io.BytesIO(TINY_PNG), 'avatar.png')},
                    headers=auth_header(tok))
        r = client.get('/api/sponsors/profile', headers=auth_header(tok))
        assert r.get_json()['sponsor']['profileImageUrl'].startswith('data:image/')
