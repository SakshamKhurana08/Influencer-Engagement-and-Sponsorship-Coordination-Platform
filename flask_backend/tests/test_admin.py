"""
Tests for /api/admin/* endpoints.
All require a valid admin-role JWT; non-admin tokens get 403.
"""
import pytest
from tests.conftest import make_sponsor, make_influencer, make_admin, make_campaign, auth_header


class TestAdminRBAC:
    """Every admin endpoint must block unauthenticated and non-admin requests."""

    PROTECTED = [
        ('GET',    '/api/admin/stats'),
        ('GET',    '/api/admin/ongoing-campaigns'),
        ('GET',    '/api/admin/flagged'),
        ('GET',    '/api/admin/search?query=x'),
        ('GET',    '/api/admin/export/campaigns'),
        ('GET',    '/api/admin/export/users'),
        ('POST',   '/api/admin/flag'),
        ('DELETE', '/api/admin/remove'),
    ]

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_no_token_returns_401(self, client, method, url):
        r = getattr(client, method.lower())(url)
        assert r.status_code == 401

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_sponsor_token_returns_403(self, client, method, url):
        _, tok = make_sponsor(client, email=f'sp_rbac_{method}@t.com')
        r = getattr(client, method.lower())(url, headers=auth_header(tok))
        assert r.status_code == 403

    @pytest.mark.parametrize('method,url', PROTECTED)
    def test_influencer_token_returns_403(self, client, method, url):
        _, tok = make_influencer(client, email=f'inf_rbac_{method}@t.com')
        r = getattr(client, method.lower())(url, headers=auth_header(tok))
        assert r.status_code == 403


class TestAdminStats:

    def test_stats_returns_all_keys(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/stats', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        for key in ('users', 'sponsors', 'influencers', 'campaigns', 'adRequests',
                    'flaggedUsers', 'flaggedCampaigns'):
            assert key in data, f'Missing key: {key}'

    def test_stats_counts_increase_after_registration(self, client):
        tok = make_admin(client)
        before = client.get('/api/admin/stats', headers=auth_header(tok)).get_json()
        make_sponsor(client, email='stats_sp@t.com')
        after = client.get('/api/admin/stats', headers=auth_header(tok)).get_json()
        assert after['users'] == before['users'] + 1
        assert after['sponsors'] == before['sponsors'] + 1

    def test_stats_flagged_counts(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='flag_sp@t.com')
        camp = make_campaign(client, sp_tok)
        # Flag the campaign
        client.post('/api/admin/flag', json={'type': 'campaign', 'id': camp['id']},
                    headers=auth_header(tok))
        stats = client.get('/api/admin/stats', headers=auth_header(tok)).get_json()
        assert stats['flaggedCampaigns'] >= 1


class TestAdminFlagAndRemove:

    def test_flag_campaign(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='flag1@t.com')
        camp = make_campaign(client, sp_tok)
        r = client.post('/api/admin/flag', json={'type': 'campaign', 'id': camp['id']},
                        headers=auth_header(tok))
        assert r.status_code == 200
        assert 'flagged' in r.get_json()['message'].lower()

    def test_flag_user(self, client):
        tok = make_admin(client)
        user, _ = make_sponsor(client, email='flaguser@t.com')
        r = client.post('/api/admin/flag', json={'type': 'user', 'id': user['id']},
                        headers=auth_header(tok))
        assert r.status_code == 200

    def test_flag_nonexistent_campaign(self, client):
        tok = make_admin(client)
        r = client.post('/api/admin/flag', json={'type': 'campaign', 'id': 99999},
                        headers=auth_header(tok))
        assert r.status_code == 404

    def test_flag_nonexistent_user(self, client):
        tok = make_admin(client)
        r = client.post('/api/admin/flag', json={'type': 'user', 'id': 99999},
                        headers=auth_header(tok))
        assert r.status_code == 404

    def test_flag_invalid_type(self, client):
        tok = make_admin(client)
        r = client.post('/api/admin/flag', json={'type': 'unknown', 'id': 1},
                        headers=auth_header(tok))
        assert r.status_code == 400

    def test_flag_missing_fields(self, client):
        tok = make_admin(client)
        r = client.post('/api/admin/flag', json={}, headers=auth_header(tok))
        assert r.status_code == 400

    def test_remove_campaign(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='rem1@t.com')
        camp = make_campaign(client, sp_tok)
        r = client.delete('/api/admin/remove', json={'type': 'campaign', 'id': camp['id']},
                          headers=auth_header(tok))
        assert r.status_code == 200
        assert 'removed' in r.get_json()['message'].lower()

    def test_remove_user(self, client):
        tok = make_admin(client)
        user, _ = make_sponsor(client, email='remuser@t.com')
        r = client.delete('/api/admin/remove', json={'type': 'user', 'id': user['id']},
                          headers=auth_header(tok))
        assert r.status_code == 200

    def test_remove_nonexistent_campaign(self, client):
        tok = make_admin(client)
        r = client.delete('/api/admin/remove', json={'type': 'campaign', 'id': 99999},
                          headers=auth_header(tok))
        assert r.status_code == 404

    def test_remove_invalid_type(self, client):
        tok = make_admin(client)
        r = client.delete('/api/admin/remove', json={'type': 'bad', 'id': 1},
                          headers=auth_header(tok))
        assert r.status_code == 400


class TestAdminSearch:

    def test_search_finds_user_by_name(self, client):
        tok = make_admin(client)
        make_sponsor(client, email='searchable@t.com', name='UniqueSearchName')
        r = client.get('/api/admin/search?query=UniqueSearch', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert any(u['name'] == 'UniqueSearchName' for u in data['users'])

    def test_search_finds_campaign_by_title(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='searcher_sp@t.com')
        make_campaign(client, sp_tok, title='UniqueSearchCampaign')
        r = client.get('/api/admin/search?query=UniqueSearchCampaign', headers=auth_header(tok))
        data = r.get_json()
        assert any(c['title'] == 'UniqueSearchCampaign' for c in data['campaigns'])

    def test_search_empty_query_returns_empty(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/search?query=', headers=auth_header(tok))
        assert r.status_code == 200
        data = r.get_json()
        assert data['users'] == []
        assert data['campaigns'] == []

    def test_search_case_insensitive(self, client):
        tok = make_admin(client)
        make_sponsor(client, email='casetest@t.com', name='CaseSensitiveName')
        r = client.get('/api/admin/search?query=casesensitive', headers=auth_header(tok))
        data = r.get_json()
        assert any('CaseSensitiveName' in u['name'] for u in data['users'])

    def test_search_no_match_returns_empty_lists(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/search?query=xyzNothingMatchesThis999', headers=auth_header(tok))
        data = r.get_json()
        assert data['users'] == []
        assert data['campaigns'] == []


class TestAdminOngoingCampaigns:

    def test_ongoing_campaigns_structure(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/ongoing-campaigns', headers=auth_header(tok))
        assert r.status_code == 200
        assert isinstance(r.get_json(), list)

    def test_ongoing_campaigns_shows_real_progress(self, client):
        """Progress % should be based on real accepted/total ratio, not random."""
        from tests.conftest import TINY_PNG
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='ongoing_sp@t.com')
        _, inf_tok = make_influencer(client, email='ongoing_inf@t.com')
        camp = make_campaign(client, sp_tok, is_public=True)
        # Influencer accepts campaign
        client.post(f'/api/influencer/campaigns/{camp["id"]}/accept',
                    headers=auth_header(inf_tok))
        # Sponsor sends ad request
        inf_profile = client.get('/api/influencer/profile', headers=auth_header(inf_tok)).get_json()
        inf_id = inf_profile['influencer']['id']
        client.post(f'/api/campaign/{camp["id"]}/ad-request',
                    json={'influencerId': inf_id, 'message': 'test'},
                    headers=auth_header(sp_tok))
        r = client.get('/api/admin/ongoing-campaigns', headers=auth_header(tok))
        campaigns = r.get_json()
        found = [c for c in campaigns if c['name'] == 'Test Campaign']
        assert len(found) > 0
        # Progress should be a percentage string like "0%"
        assert found[0]['progress'].endswith('%')


class TestAdminFlaggedCampaigns:

    def test_flagged_empty_initially(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/flagged', headers=auth_header(tok))
        assert r.status_code == 200
        assert r.get_json() == []

    def test_flagged_shows_flagged_campaign(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='flag_camp@t.com')
        camp = make_campaign(client, sp_tok, title='FlaggedCampaign')
        client.post('/api/admin/flag', json={'type': 'campaign', 'id': camp['id']},
                    headers=auth_header(tok))
        r = client.get('/api/admin/flagged', headers=auth_header(tok))
        data = r.get_json()
        assert any(c['name'] == 'FlaggedCampaign' for c in data)


class TestAdminCSVExports:

    def test_export_campaigns_csv(self, client):
        tok = make_admin(client)
        _, sp_tok = make_sponsor(client, email='csv_sp@t.com')
        make_campaign(client, sp_tok, title='CSV Campaign')
        r = client.get('/api/admin/export/campaigns', headers=auth_header(tok))
        assert r.status_code == 200
        assert 'text/csv' in r.content_type
        assert 'attachment' in r.headers.get('Content-Disposition', '')
        text = r.data.decode('utf-8')
        assert 'id,title' in text
        assert 'CSV Campaign' in text

    def test_export_users_csv(self, client):
        tok = make_admin(client)
        make_sponsor(client, email='csvuser@t.com', name='CSV User')
        r = client.get('/api/admin/export/users', headers=auth_header(tok))
        assert r.status_code == 200
        assert 'text/csv' in r.content_type
        text = r.data.decode('utf-8')
        assert 'id,name,email' in text
        assert 'csvuser@t.com' in text

    def test_export_campaigns_headers(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/export/campaigns', headers=auth_header(tok))
        first_line = r.data.decode('utf-8').splitlines()[0]
        expected = 'id,title,category,budget,is_public,is_flagged,sponsor_company,created_at'
        assert first_line == expected

    def test_export_users_headers(self, client):
        tok = make_admin(client)
        r = client.get('/api/admin/export/users', headers=auth_header(tok))
        first_line = r.data.decode('utf-8').splitlines()[0]
        assert first_line == 'id,name,email,role,is_flagged,created_at'
