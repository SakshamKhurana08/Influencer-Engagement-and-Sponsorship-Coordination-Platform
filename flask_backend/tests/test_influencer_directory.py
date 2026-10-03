"""
Tests for GET /api/sponsors/influencers — influencer directory endpoint.
"""
import pytest
from tests.conftest import make_sponsor, make_influencer, make_admin, auth_header


class TestInfluencerDirectoryRBAC:

    def test_no_token_returns_401(self, client):
        r = client.get('/api/sponsors/influencers')
        assert r.status_code == 401

    def test_influencer_token_returns_403(self, client):
        _, tok = make_influencer(client, email='dir_rbac@t.com')
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        assert r.status_code == 403

    def test_admin_token_returns_403(self, client):
        tok = make_admin(client, email='dir_admin@t.com')
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        assert r.status_code == 403


class TestInfluencerDirectoryList:

    def _setup(self, client):
        """Create a sponsor + 3 influencers with different attributes."""
        _, sp_tok = make_sponsor(client, email='dir_sp@t.com')
        make_influencer(client, email='inf_a@t.com', name='Alice',
                        category='Fashion', niche='Streetwear', reach=50000)
        make_influencer(client, email='inf_b@t.com', name='Bob',
                        category='Tech',    niche='Gadgets',    reach=120000)
        make_influencer(client, email='inf_c@t.com', name='Charlie',
                        category='Fashion', niche='Luxury',     reach=30000)
        return sp_tok

    def test_returns_list_of_active_influencers(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert 'items' in data
        assert data['total'] == 3

    def test_response_includes_required_fields(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        item = r.get_json()['items'][0]
        for field in ('id', 'name', 'category', 'niche', 'reach', 'profileImageUrl'):
            assert field in item, f'{field} missing from response'

    def test_filters_by_category(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?category=Fashion', headers=auth_header(tok))
        items = r.get_json()['items']
        assert len(items) == 2
        assert all('Fashion' in i['category'] for i in items)

    def test_category_filter_is_case_insensitive(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?category=fashion', headers=auth_header(tok))
        assert len(r.get_json()['items']) == 2

    def test_filters_by_niche(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?niche=Gadgets', headers=auth_header(tok))
        items = r.get_json()['items']
        assert len(items) == 1
        assert items[0]['name'] == 'Bob'

    def test_filters_by_min_reach(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?minReach=50000', headers=auth_header(tok))
        items = r.get_json()['items']
        assert all(i['reach'] >= 50000 for i in items)
        assert len(items) == 2  # Alice (50000) and Bob (120000)

    def test_filters_by_max_reach(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?maxReach=50000', headers=auth_header(tok))
        items = r.get_json()['items']
        assert all(i['reach'] <= 50000 for i in items)

    def test_filters_by_name_search(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?search=alice', headers=auth_header(tok))
        items = r.get_json()['items']
        assert len(items) == 1
        assert items[0]['name'] == 'Alice'

    def test_combines_multiple_filters(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?category=Fashion&minReach=40000',
                        headers=auth_header(tok))
        items = r.get_json()['items']
        # Only Alice matches Fashion + reach >= 40000
        assert len(items) == 1
        assert items[0]['name'] == 'Alice'

    def test_no_filter_returns_all(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        assert r.get_json()['total'] == 3

    def test_excludes_flagged_influencers(self, client):
        tok = self._setup(client)
        # Flag Bob via admin
        admin_tok = make_admin(client, email='dir_adm@t.com')
        # Get Bob's user id first
        from app import db as _db
        from app.models.user import User
        with client.application.app_context():
            bob = User.query.filter_by(email='inf_b@t.com').first()
            bob.is_flagged = True
            _db.session.commit()
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        items = r.get_json()['items']
        names = [i['name'] for i in items]
        assert 'Bob' not in names
        assert len(items) == 2

    def test_pagination_page_1(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?per_page=2&page=1', headers=auth_header(tok))
        data = r.get_json()
        assert len(data['items']) == 2
        assert data['pages'] == 2
        assert data['total'] == 3

    def test_pagination_page_2(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?per_page=2&page=2', headers=auth_header(tok))
        data = r.get_json()
        assert len(data['items']) == 1

    def test_per_page_capped_at_50(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?per_page=200', headers=auth_header(tok))
        assert r.status_code == 422  # InfluencerSearchSchema validates max=50

    def test_empty_result_for_no_match(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers?category=Gaming', headers=auth_header(tok))
        data = r.get_json()
        assert data['total'] == 0
        assert data['items'] == []

    def test_response_includes_pagination_keys(self, client):
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        data = r.get_json()
        for key in ('items', 'total', 'page', 'per_page', 'pages'):
            assert key in data

    def test_email_not_exposed(self, client):
        """Email should NOT be in the public influencer directory response."""
        tok = self._setup(client)
        r = client.get('/api/sponsors/influencers', headers=auth_header(tok))
        for item in r.get_json()['items']:
            assert 'email' not in item
