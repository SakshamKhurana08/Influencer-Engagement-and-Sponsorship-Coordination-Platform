"""
Tests for /api/campaign/* endpoints (sponsor-only CRUD + ad requests).
"""
import pytest
from tests.conftest import make_sponsor, make_influencer, make_admin, make_campaign, auth_header


class TestCampaignRBAC:

    def test_create_campaign_no_token(self, client):
        r = client.post('/api/campaign/', json={'title': 'T', 'budget': 1000})
        assert r.status_code == 401

    def test_create_campaign_influencer_token(self, client):
        _, tok = make_influencer(client, email='inf_camp@t.com')
        r = client.post('/api/campaign/', json={'title': 'T', 'budget': 1000},
                        headers=auth_header(tok))
        assert r.status_code == 403

    def test_list_campaigns_admin_token(self, client):
        tok = make_admin(client)
        r = client.get('/api/campaign/my-campaigns', headers=auth_header(tok))
        assert r.status_code == 403


class TestCreateCampaign:

    def test_create_campaign_success(self, client):
        _, tok = make_sponsor(client, email='cr1@t.com')
        r = client.post('/api/campaign/', json={
            'title': 'Summer Sale', 'budget': 20000, 'category': 'Fashion', 'isPublic': True,
        }, headers=auth_header(tok))
        assert r.status_code == 201
        data = r.get_json()
        assert data['title'] == 'Summer Sale'
        assert data['budget'] == 20000
        assert data['isPublic'] is True
        assert data['isFlagged'] is False

    def test_create_campaign_minimal(self, client):
        """Only title is required."""
        _, tok = make_sponsor(client, email='cr_min@t.com')
        r = client.post('/api/campaign/', json={'title': 'Minimal'},
                        headers=auth_header(tok))
        assert r.status_code == 201

    def test_create_campaign_missing_title(self, client):
        _, tok = make_sponsor(client, email='cr_notitle@t.com')
        r = client.post('/api/campaign/', json={'budget': 1000}, headers=auth_header(tok))
        assert r.status_code == 422
        assert 'title' in r.get_json()['errors']

    def test_create_campaign_negative_budget(self, client):
        _, tok = make_sponsor(client, email='cr_negb@t.com')
        r = client.post('/api/campaign/', json={'title': 'T', 'budget': -1},
                        headers=auth_header(tok))
        assert r.status_code == 422

    def test_create_campaign_budget_zero_allowed(self, client):
        _, tok = make_sponsor(client, email='cr_zero@t.com')
        r = client.post('/api/campaign/', json={'title': 'Free', 'budget': 0},
                        headers=auth_header(tok))
        assert r.status_code == 201


class TestListCampaigns:

    def test_list_returns_paginated_structure(self, client):
        _, tok = make_sponsor(client, email='list1@t.com')
        make_campaign(client, tok, title='Camp A')
        make_campaign(client, tok, title='Camp B')
        r = client.get('/api/campaign/my-campaigns', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert 'items' in data
        assert 'total' in data
        assert 'page' in data
        assert 'pages' in data
        assert len(data['items']) == 2

    def test_list_pagination_page2(self, client):
        _, tok = make_sponsor(client, email='listpg@t.com')
        for i in range(5):
            make_campaign(client, tok, title=f'Camp {i}')
        r = client.get('/api/campaign/my-campaigns?page=1&per_page=3', headers=auth_header(tok))
        data = r.get_json()
        assert data['total'] == 5
        assert len(data['items']) == 3
        assert data['pages'] == 2

    def test_list_per_page_capped_at_100(self, client):
        _, tok = make_sponsor(client, email='listcap@t.com')
        r = client.get('/api/campaign/my-campaigns?per_page=999', headers=auth_header(tok))
        assert r.status_code == 200  # Should not error, just cap internally

    def test_list_only_own_campaigns(self, client):
        """Sponsor A cannot see Sponsor B's campaigns."""
        _, tok_a = make_sponsor(client, email='own_a@t.com')
        _, tok_b = make_sponsor(client, email='own_b@t.com')
        make_campaign(client, tok_a, title='A Campaign')
        make_campaign(client, tok_b, title='B Campaign')
        r = client.get('/api/campaign/my-campaigns', headers=auth_header(tok_a))
        titles = [c['title'] for c in r.get_json()['items']]
        assert 'A Campaign' in titles
        assert 'B Campaign' not in titles

    def test_list_includes_accepted_influencers(self, client):
        _, sp_tok = make_sponsor(client, email='accli_sp@t.com')
        _, inf_tok = make_influencer(client, email='accli_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept',
                    headers=auth_header(inf_tok))
        r = client.get('/api/campaign/my-campaigns', headers=auth_header(sp_tok))
        camp_data = r.get_json()['items'][0]
        assert 'acceptedInfluencers' in camp_data
        assert len(camp_data['acceptedInfluencers']) == 1


class TestUpdateCampaign:

    def test_update_own_campaign(self, client):
        _, tok = make_sponsor(client, email='upd1@t.com')
        camp = make_campaign(client, tok, title='Old Title')
        r = client.put(f'/api/campaign/{camp["id"]}',
                       json={'title': 'New Title', 'budget': 99999},
                       headers=auth_header(tok))
        assert r.status_code == 200
        assert r.get_json()['title'] == 'New Title'
        assert r.get_json()['budget'] == 99999

    def test_update_partial_fields(self, client):
        """Only provided fields are updated; others stay unchanged."""
        _, tok = make_sponsor(client, email='upd_partial@t.com')
        camp = make_campaign(client, tok, title='Stay', budget=5000)
        r = client.put(f'/api/campaign/{camp["id"]}',
                       json={'budget': 9999},
                       headers=auth_header(tok))
        assert r.status_code == 200
        assert r.get_json()['title'] == 'Stay'
        assert r.get_json()['budget'] == 9999

    def test_update_another_sponsors_campaign(self, client):
        _, tok_a = make_sponsor(client, email='upd_a@t.com')
        _, tok_b = make_sponsor(client, email='upd_b@t.com')
        camp = make_campaign(client, tok_a)
        r = client.put(f'/api/campaign/{camp["id"]}',
                       json={'title': 'Hijack'},
                       headers=auth_header(tok_b))
        assert r.status_code == 404

    def test_update_nonexistent_campaign(self, client):
        _, tok = make_sponsor(client, email='upd_ghost@t.com')
        r = client.put('/api/campaign/99999', json={'title': 'X'}, headers=auth_header(tok))
        assert r.status_code == 404


class TestDeleteCampaign:

    def test_delete_own_campaign(self, client):
        _, tok = make_sponsor(client, email='del1@t.com')
        camp = make_campaign(client, tok)
        r = client.delete(f'/api/campaign/{camp["id"]}', headers=auth_header(tok))
        assert r.status_code == 200
        # Verify it's gone
        r2 = client.get('/api/campaign/my-campaigns', headers=auth_header(tok))
        assert r2.get_json()['total'] == 0

    def test_delete_another_sponsors_campaign(self, client):
        _, tok_a = make_sponsor(client, email='del_a@t.com')
        _, tok_b = make_sponsor(client, email='del_b@t.com')
        camp = make_campaign(client, tok_a)
        r = client.delete(f'/api/campaign/{camp["id"]}', headers=auth_header(tok_b))
        assert r.status_code == 404

    def test_delete_cascades_ad_requests(self, client):
        """Deleting a campaign should also delete its ad requests."""
        _, sp_tok = make_sponsor(client, email='del_cas_sp@t.com')
        _, inf_tok = make_influencer(client, email='del_cas_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        inf_profile = client.get('/api/influencer/profile', headers=auth_header(inf_tok)).get_json()
        inf_id = inf_profile['influencer']['id']
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        client.post(f'/api/campaign/{camp["id"]}/ad-request',
                    json={'influencerId': inf_id, 'message': 'test'},
                    headers=auth_header(sp_tok))
        # Delete campaign
        client.delete(f'/api/campaign/{camp["id"]}', headers=auth_header(sp_tok))
        # Ad requests should be gone too (cascade)
        r = client.get(f'/api/campaign/{camp["id"]}/ad-requests', headers=auth_header(sp_tok))
        assert r.status_code == 404


class TestAdRequestCRUD:

    def _setup(self, client):
        """Returns (sp_tok, inf_tok, camp_id, inf_id)."""
        _, sp_tok = make_sponsor(client, email='ar_sp@t.com')
        _, inf_tok = make_influencer(client, email='ar_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept', headers=auth_header(inf_tok))
        inf_id = client.get('/api/influencer/profile', headers=auth_header(inf_tok)).get_json()['influencer']['id']
        return sp_tok, inf_tok, camp['id'], inf_id

    def test_create_ad_request_success(self, client):
        sp_tok, _, camp_id, inf_id = self._setup(client)
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'influencerId': inf_id, 'message': 'Hello', 'proposedTerms': '3 posts'},
                        headers=auth_header(sp_tok))
        assert r.status_code == 201
        data = r.get_json()
        assert data['status'] == 'pending'
        assert data['message'] == 'Hello'
        assert data['proposedTerms'] == '3 posts'

    def test_create_ad_request_missing_message(self, client):
        sp_tok, _, camp_id, inf_id = self._setup(client)
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'influencerId': inf_id},
                        headers=auth_header(sp_tok))
        assert r.status_code == 422

    def test_create_ad_request_wrong_campaign(self, client):
        _, sp_tok = make_sponsor(client, email='ar_wrong@t.com')
        r = client.post('/api/campaign/99999/ad-request',
                        json={'message': 'test'},
                        headers=auth_header(sp_tok))
        assert r.status_code == 404

    def test_list_ad_requests_paginated(self, client):
        sp_tok, _, camp_id, inf_id = self._setup(client)
        for i in range(3):
            client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'message': f'msg {i}'},
                        headers=auth_header(sp_tok))
        r = client.get(f'/api/campaign/{camp_id}/ad-requests', headers=auth_header(sp_tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['total'] == 3
        assert 'items' in data

    def test_update_ad_request_status(self, client):
        sp_tok, _, camp_id, inf_id = self._setup(client)
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'message': 'test'}, headers=auth_header(sp_tok))
        ar_id = r.get_json()['id']
        r2 = client.put(f'/api/campaign/ad-request/{ar_id}',
                        json={'status': 'accepted'},
                        headers=auth_header(sp_tok))
        assert r2.status_code == 200
        assert r2.get_json()['status'] == 'accepted'

    def test_update_ad_request_invalid_status(self, client):
        sp_tok, _, camp_id, _ = self._setup(client)
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'message': 'test'}, headers=auth_header(sp_tok))
        ar_id = r.get_json()['id']
        r2 = client.put(f'/api/campaign/ad-request/{ar_id}',
                        json={'status': 'INVALID_STATUS'},
                        headers=auth_header(sp_tok))
        assert r2.status_code == 422

    def test_update_ad_request_wrong_owner(self, client):
        sp_tok, _, camp_id, _ = self._setup(client)
        _, sp2_tok = make_sponsor(client, email='ar_owner2@t.com')
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'message': 'test'}, headers=auth_header(sp_tok))
        ar_id = r.get_json()['id']
        r2 = client.put(f'/api/campaign/ad-request/{ar_id}',
                        json={'status': 'accepted'},
                        headers=auth_header(sp2_tok))
        assert r2.status_code == 403

    def test_delete_ad_request(self, client):
        sp_tok, _, camp_id, _ = self._setup(client)
        r = client.post(f'/api/campaign/{camp_id}/ad-request',
                        json={'message': 'delete me'}, headers=auth_header(sp_tok))
        ar_id = r.get_json()['id']
        r2 = client.delete(f'/api/campaign/ad-request/{ar_id}', headers=auth_header(sp_tok))
        assert r2.status_code == 200

    def test_delete_nonexistent_ad_request(self, client):
        _, tok = make_sponsor(client, email='ar_del_ghost@t.com')
        r = client.delete('/api/campaign/ad-request/99999', headers=auth_header(tok))
        assert r.status_code == 404


class TestPublicCampaigns:

    def test_public_endpoint_no_auth(self, client):
        """GET /api/campaign/public is unauthenticated."""
        r = client.get('/api/campaign/public')
        assert r.status_code == 200
        assert isinstance(r.get_json(), list)

    def test_public_endpoint_limit(self, client):
        _, tok = make_sponsor(client, email='pub_lim@t.com')
        for i in range(5):
            make_campaign(client, tok, title=f'Public {i}', is_public=True)
        r = client.get('/api/campaign/public?limit=3')
        assert len(r.get_json()) <= 3

    def test_public_endpoint_only_returns_public(self, client):
        _, tok = make_sponsor(client, email='pub_only@t.com')
        make_campaign(client, tok, title='Public Camp', is_public=True)
        make_campaign(client, tok, title='Private Camp', is_public=False)
        r = client.get('/api/campaign/public')
        titles = [c['title'] for c in r.get_json()]
        assert 'Public Camp' in titles
        assert 'Private Camp' not in titles
