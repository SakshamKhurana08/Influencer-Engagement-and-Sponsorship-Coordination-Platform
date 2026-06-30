"""
Tests for /api/influencer/* endpoints.
"""
import pytest
from tests.conftest import make_sponsor, make_influencer, make_admin, make_campaign, auth_header


class TestInfluencerRBAC:

    PROTECTED = [
        ('GET',  '/api/influencer/profile'),
        ('PUT',  '/api/influencer/profile'),
        ('GET',  '/api/influencer/open-campaigns'),
        ('GET',  '/api/influencer/ad-requests'),
    ]

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_no_token_401(self, client, method, url):
        r = getattr(client, method.lower())(url)
        assert r.status_code == 401

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_sponsor_token_403(self, client, method, url):
        _, tok = make_sponsor(client, email=f'rbac_sp_{method}@t.com')
        r = getattr(client, method.lower())(url, headers=auth_header(tok))
        assert r.status_code == 403


class TestInfluencerProfile:

    def test_get_profile_success(self, client):
        _, tok = make_influencer(client, email='ipro@t.com', name='Inf Pro',
                                  category='Tech', niche='AI', reach=50000)
        r = client.get('/api/influencer/profile', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['influencer']['category'] == 'Tech'
        assert data['influencer']['niche'] == 'AI'
        assert data['influencer']['reach'] == 50000
        assert data['user']['name'] == 'Inf Pro'

    def test_update_profile_success(self, client):
        _, tok = make_influencer(client, email='iupd@t.com')
        r = client.put('/api/influencer/profile',
                       json={'name': 'Updated Name', 'category': 'Fashion',
                             'niche': 'Luxury', 'reach': 99999},
                       headers=auth_header(tok))
        assert r.status_code == 200
        assert r.get_json()['user']['name'] == 'Updated Name'
        assert r.get_json()['influencer']['reach'] == 99999

    def test_update_profile_missing_field(self, client):
        _, tok = make_influencer(client, email='iupd_miss@t.com')
        r = client.put('/api/influencer/profile',
                       json={'name': 'X', 'category': 'Y', 'niche': 'Z'},  # missing reach
                       headers=auth_header(tok))
        assert r.status_code == 422

    def test_update_profile_negative_reach(self, client):
        _, tok = make_influencer(client, email='iupd_neg@t.com')
        r = client.put('/api/influencer/profile',
                       json={'name': 'X', 'category': 'Y', 'niche': 'Z', 'reach': -1},
                       headers=auth_header(tok))
        assert r.status_code == 422

    def test_update_profile_zero_reach_allowed(self, client):
        _, tok = make_influencer(client, email='iupd_zero@t.com')
        r = client.put('/api/influencer/profile',
                       json={'name': 'X', 'category': 'Y', 'niche': 'Z', 'reach': 0},
                       headers=auth_header(tok))
        assert r.status_code == 200

    def test_profile_image_url_is_none_by_default(self, client):
        _, tok = make_influencer(client, email='nopic@t.com')
        r = client.get('/api/influencer/profile', headers=auth_header(tok))
        assert r.get_json()['influencer']['profileImageUrl'] is None


class TestOpenCampaigns:

    def _create_public_campaign(self, client, title='Open Camp', budget=10000,
                                 category='Tech', is_public=True):
        _, sp_tok = make_sponsor(client, email=f'oc_sp_{title.replace(" ","")}@t.com')
        return make_campaign(client, sp_tok, title=title, budget=budget,
                             category=category, is_public=is_public), sp_tok

    def test_open_campaigns_returns_list(self, client):
        _, inf_tok = make_influencer(client, email='oc_list@t.com')
        r = client.get('/api/influencer/open-campaigns', headers=auth_header(inf_tok))
        assert r.status_code == 200
        data = r.get_json()
        assert 'items' in data
        assert 'total' in data

    def test_open_campaigns_only_public(self, client):
        _, inf_tok = make_influencer(client, email='oc_pub@t.com')
        self._create_public_campaign(client, title='Visible', is_public=True)
        self._create_public_campaign(client, title='Hidden', is_public=False)
        r = client.get('/api/influencer/open-campaigns', headers=auth_header(inf_tok))
        titles = [c['title'] for c in r.get_json()['items']]
        assert 'Visible' in titles
        assert 'Hidden' not in titles

    def test_open_campaigns_filter_by_category(self, client):
        _, inf_tok = make_influencer(client, email='oc_cat@t.com')
        self._create_public_campaign(client, title='Tech Campaign', category='Tech')
        self._create_public_campaign(client, title='Food Campaign', category='Food')
        r = client.get('/api/influencer/open-campaigns?category=Tech', headers=auth_header(inf_tok))
        items = r.get_json()['items']
        assert all('Tech' in c.get('category', '') for c in items)

    def test_open_campaigns_filter_by_min_budget(self, client):
        _, inf_tok = make_influencer(client, email='oc_bud@t.com')
        self._create_public_campaign(client, title='Cheap', budget=500)
        self._create_public_campaign(client, title='Expensive', budget=50000)
        r = client.get('/api/influencer/open-campaigns?minBudget=10000', headers=auth_header(inf_tok))
        items = r.get_json()['items']
        assert all(c['budget'] >= 10000 for c in items)
        assert not any(c['title'] == 'Cheap' for c in items)

    def test_open_campaigns_includes_is_accepted_by_user(self, client):
        _, inf_tok = make_influencer(client, email='oc_flag@t.com')
        self._create_public_campaign(client, title='AcceptTest')
        r = client.get('/api/influencer/open-campaigns', headers=auth_header(inf_tok))
        items = r.get_json()['items']
        assert all('isAcceptedByUser' in c for c in items)
        assert all(c['isAcceptedByUser'] is False for c in items)

    def test_open_campaigns_pagination(self, client):
        _, inf_tok = make_influencer(client, email='oc_pg@t.com')
        for i in range(5):
            self._create_public_campaign(client, title=f'Paged {i}', budget=1000 * i + 1)
        r = client.get('/api/influencer/open-campaigns?per_page=2', headers=auth_header(inf_tok))
        data = r.get_json()
        assert len(data['items']) <= 2
        assert data['total'] >= 5


class TestAcceptCampaign:

    def test_accept_campaign_success(self, client):
        _, sp_tok = make_sponsor(client, email='acc_sp@t.com')
        _, inf_tok = make_influencer(client, email='acc_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        r = client.post(f'/api/influencer/campaigns/{camp["id"]}/accept',
                        headers=auth_header(inf_tok))
        assert r.status_code == 200
        assert r.get_json()['message'] == 'Campaign accepted'

    def test_accept_campaign_updates_is_accepted_flag(self, client):
        _, sp_tok = make_sponsor(client, email='acc_flag_sp@t.com')
        _, inf_tok = make_influencer(client, email='acc_flag_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        r = client.get('/api/influencer/open-campaigns', headers=auth_header(inf_tok))
        items = r.get_json()['items']
        accepted = [c for c in items if c['id'] == camp['id']]
        assert len(accepted) == 1
        assert accepted[0]['isAcceptedByUser'] is True

    def test_accept_campaign_duplicate(self, client):
        _, sp_tok = make_sponsor(client, email='acc_dup_sp@t.com')
        _, inf_tok = make_influencer(client, email='acc_dup_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        r = client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        assert r.status_code == 400
        assert 'already accepted' in r.get_json()['message'].lower()

    def test_accept_private_campaign(self, client):
        _, sp_tok = make_sponsor(client, email='acc_priv_sp@t.com')
        _, inf_tok = make_influencer(client, email='acc_priv_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=False)
        r = client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        assert r.status_code == 404

    def test_accept_nonexistent_campaign(self, client):
        _, inf_tok = make_influencer(client, email='acc_ghost@t.com')
        r = client.post('/api/influencer/campaigns/99999/accept', headers=auth_header(inf_tok))
        assert r.status_code == 404


class TestAdRequestActions:

    def _setup_with_ad_request(self, client):
        """Returns (sp_tok, inf_tok, ar_id)."""
        _, sp_tok = make_sponsor(client, email='aract_sp@t.com')
        _, inf_tok = make_influencer(client, email='aract_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        inf_id = client.get('/api/influencer/profile', headers=auth_header(inf_tok)).get_json()['influencer']['id']
        r = client.post(f'/api/campaign/{camp["id"]}/ad-request',
                        json={'influencerId': inf_id, 'message': 'Work with us'},
                        headers=auth_header(sp_tok))
        return sp_tok, inf_tok, r.get_json()['id']

    def test_accept_ad_request(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/accept', headers=auth_header(inf_tok))
        assert r.status_code == 200

    def test_reject_ad_request(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/reject', headers=auth_header(inf_tok))
        assert r.status_code == 200

    def test_negotiate_ad_request(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/negotiate',
                        json={'counterTerms': '2 posts for 8000'},
                        headers=auth_header(inf_tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['adRequest']['status'] == 'negotiation'
        assert data['adRequest']['proposedTerms'] == '2 posts for 8000'

    def test_negotiate_without_counter_terms(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/negotiate',
                        json={}, headers=auth_header(inf_tok))
        assert r.status_code == 400

    def test_negotiate_with_empty_counter_terms(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/negotiate',
                        json={'counterTerms': '   '}, headers=auth_header(inf_tok))
        assert r.status_code == 400

    def test_re_negotiate_allowed(self, client):
        """Can negotiate again from negotiation status."""
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        client.post(f'/api/influencer/ad-requests/{ar_id}/negotiate',
                    json={'counterTerms': 'first offer'}, headers=auth_header(inf_tok))
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/negotiate',
                        json={'counterTerms': 'revised offer'}, headers=auth_header(inf_tok))
        assert r.status_code == 200
        assert r.get_json()['adRequest']['proposedTerms'] == 'revised offer'

    def test_accept_after_accept_blocked(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        client.post(f'/api/influencer/ad-requests/{ar_id}/accept', headers=auth_header(inf_tok))
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/accept', headers=auth_header(inf_tok))
        assert r.status_code == 400
        assert 'already' in r.get_json()['message'].lower()

    def test_reject_after_reject_blocked(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        client.post(f'/api/influencer/ad-requests/{ar_id}/reject', headers=auth_header(inf_tok))
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/reject', headers=auth_header(inf_tok))
        assert r.status_code == 400

    def test_invalid_action(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.post(f'/api/influencer/ad-requests/{ar_id}/explode', headers=auth_header(inf_tok))
        assert r.status_code == 400

    def test_nonexistent_ad_request(self, client):
        _, inf_tok = make_influencer(client, email='ar_ghost@t.com')
        r = client.post('/api/influencer/ad-requests/99999/accept', headers=auth_header(inf_tok))
        assert r.status_code == 404

    def test_get_ad_requests_empty_if_no_accepted_campaigns(self, client):
        _, inf_tok = make_influencer(client, email='ar_empty@t.com')
        r = client.get('/api/influencer/ad-requests', headers=auth_header(inf_tok))
        assert r.status_code == 200
        assert r.get_json() == []

    def test_get_ad_requests_includes_campaign_sponsor(self, client):
        _, inf_tok, ar_id = self._setup_with_ad_request(client)
        r = client.get('/api/influencer/ad-requests', headers=auth_header(inf_tok))
        assert r.status_code == 200
        requests = r.get_json()
        assert len(requests) == 1
        assert 'Campaign' in requests[0]
        assert 'Sponsor' in requests[0]['Campaign']
