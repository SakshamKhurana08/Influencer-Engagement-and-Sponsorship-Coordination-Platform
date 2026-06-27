"""
Campaign routes — all protected by sponsor_required() RBAC guard.

POST   /api/campaign/                               — create campaign
GET    /api/campaign/my-campaigns                   — list sponsor's campaigns
PUT    /api/campaign/<id>                           — update campaign (owner only)
DELETE /api/campaign/<id>                           — delete campaign (owner only)
POST   /api/campaign/<campaign_id>/ad-request       — send ad request to influencer
GET    /api/campaign/<campaign_id>/ad-requests      — list ad requests for a campaign
PUT    /api/campaign/ad-request/<ad_request_id>     — update ad request
DELETE /api/campaign/ad-request/<ad_request_id>     — delete ad request
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models.sponsor import Sponsor
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest
from app.utils.auth import sponsor_required

campaign_bp = Blueprint('campaign', __name__)


def _get_sponsor_for_user(user_id: int) -> Sponsor | None:
    return Sponsor.query.filter_by(user_id=user_id).first()


def _own_campaign(campaign_id: int, sponsor_id: int) -> Campaign | None:
    """Return campaign if it belongs to the sponsor, else None."""
    return Campaign.query.filter_by(id=campaign_id, sponsor_id=sponsor_id).first()


# ── Campaign CRUD ─────────────────────────────────────────────────────────────

@campaign_bp.route('/', methods=['POST'])
@sponsor_required()
def create_campaign():
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    body = request.get_json(silent=True) or {}
    title = body.get('title', '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400

    campaign = Campaign(
        sponsor_id=sponsor.id,
        title=title,
        description=body.get('description', ''),
        category=body.get('category', ''),
        budget=int(body['budget']) if body.get('budget') else None,
        is_public=bool(body.get('isPublic', True))
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify(campaign.to_dict()), 201


@campaign_bp.route('/my-campaigns', methods=['GET'])
@sponsor_required()
def get_my_campaigns():
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
    return jsonify([c.to_dict(include_influencers=True) for c in campaigns]), 200


@campaign_bp.route('/<int:campaign_id>', methods=['PUT'])
@sponsor_required()
def update_campaign(campaign_id):
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    campaign = _own_campaign(campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Campaign not found or unauthorized'}), 404

    body = request.get_json(silent=True) or {}
    if 'title' in body:
        campaign.title = body['title']
    if 'description' in body:
        campaign.description = body['description']
    if 'category' in body:
        campaign.category = body['category']
    if 'budget' in body:
        campaign.budget = int(body['budget']) if body['budget'] else None
    if 'isPublic' in body:
        campaign.is_public = bool(body['isPublic'])

    db.session.commit()
    return jsonify(campaign.to_dict()), 200


@campaign_bp.route('/<int:campaign_id>', methods=['DELETE'])
@sponsor_required()
def delete_campaign(campaign_id):
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    campaign = _own_campaign(campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Campaign not found or unauthorized'}), 404

    db.session.delete(campaign)
    db.session.commit()
    return jsonify({'message': 'Campaign deleted successfully'}), 200


# ── Ad Request CRUD ───────────────────────────────────────────────────────────

@campaign_bp.route('/<int:campaign_id>/ad-request', methods=['POST'])
@sponsor_required()
def create_ad_request(campaign_id):
    """Send an ad request to an influencer for a campaign."""
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    campaign = _own_campaign(campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Campaign not found or unauthorized'}), 404

    body = request.get_json(silent=True) or {}
    influencer_id = body.get('influencerId')

    ad_request = AdRequest(
        campaign_id=campaign_id,
        influencer_id=int(influencer_id) if influencer_id else None,
        message=body.get('message', ''),
        proposed_terms=body.get('proposedTerms', '')
    )
    db.session.add(ad_request)
    db.session.commit()
    return jsonify(ad_request.to_dict()), 201


@campaign_bp.route('/<int:campaign_id>/ad-requests', methods=['GET'])
@sponsor_required()
def get_ad_requests(campaign_id):
    """List all ad requests for a campaign owned by the authenticated sponsor."""
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    campaign = _own_campaign(campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Campaign not found or unauthorized'}), 404

    ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id).all()
    return jsonify([ar.to_dict() for ar in ad_requests]), 200


@campaign_bp.route('/ad-request/<int:ad_request_id>', methods=['PUT'])
@sponsor_required()
def update_ad_request(ad_request_id):
    """Update status, message, or proposedTerms on an ad request."""
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    ar = AdRequest.query.get(ad_request_id)
    if not ar:
        return jsonify({'error': 'Ad request not found'}), 404

    # Verify campaign ownership
    campaign = _own_campaign(ar.campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Unauthorized to update this ad request'}), 403

    body = request.get_json(silent=True) or {}
    valid_statuses = ('pending', 'accepted', 'rejected', 'negotiation')
    if 'status' in body:
        if body['status'] not in valid_statuses:
            return jsonify({'error': f'status must be one of {valid_statuses}'}), 400
        ar.status = body['status']
    if 'message' in body:
        ar.message = body['message']
    if 'proposedTerms' in body:
        ar.proposed_terms = body['proposedTerms']

    db.session.commit()
    return jsonify(ar.to_dict()), 200


@campaign_bp.route('/ad-request/<int:ad_request_id>', methods=['DELETE'])
@sponsor_required()
def delete_ad_request(ad_request_id):
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor_for_user(user_id)
    if not sponsor:
        return jsonify({'error': 'Sponsor profile not found'}), 404

    ar = AdRequest.query.get(ad_request_id)
    if not ar:
        return jsonify({'error': 'Ad request not found'}), 404

    campaign = _own_campaign(ar.campaign_id, sponsor.id)
    if not campaign:
        return jsonify({'error': 'Unauthorized to delete this ad request'}), 403

    db.session.delete(ar)
    db.session.commit()
    return jsonify({'message': 'Ad request deleted successfully'}), 200
