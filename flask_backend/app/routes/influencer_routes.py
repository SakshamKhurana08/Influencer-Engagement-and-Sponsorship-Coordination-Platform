"""
Influencer routes — protected by influencer_required() RBAC guard.

GET  /api/influencer/profile                    — view profile
PUT  /api/influencer/profile                    — update profile
GET  /api/influencer/open-campaigns             — browse public campaigns
POST /api/influencer/campaigns/<id>/accept      — accept a public campaign
GET  /api/influencer/ad-requests                — view ad requests for accepted campaigns
POST /api/influencer/ad-requests/<id>/<action>  — accept | reject an ad request
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest
from app.utils.auth import influencer_required

influencer_bp = Blueprint('influencer', __name__)


def _get_influencer(user_id: int):
    """Helper — fetch Influencer by authenticated user_id."""
    return Influencer.query.filter_by(user_id=user_id).first()


@influencer_bp.route('/profile', methods=['GET'])
@influencer_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    influencer = _get_influencer(user_id)

    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404

    return jsonify({'influencer': influencer.to_dict(), 'user': user.to_dict()}), 200


@influencer_bp.route('/profile', methods=['PUT'])
@influencer_required()
def update_profile():
    """Update name (on User) plus category, niche, reach (on Influencer)."""
    user_id = int(get_jwt_identity())
    body = request.get_json(silent=True) or {}

    name = body.get('name', '').strip()
    category = body.get('category', '').strip()
    niche = body.get('niche', '').strip()
    reach = body.get('reach')

    if not all([name, category, niche, reach]):
        return jsonify({'message': 'name, category, niche, and reach are required'}), 400

    user = User.query.get(user_id)
    influencer = _get_influencer(user_id)

    if not user or not influencer:
        return jsonify({'message': 'Profile not found'}), 404

    user.name = name
    influencer.category = category
    influencer.niche = niche
    influencer.reach = int(reach)

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(),
        'influencer': influencer.to_dict()
    }), 200


@influencer_bp.route('/open-campaigns', methods=['GET'])
@influencer_required()
def get_open_campaigns():
    """
    Returns all public campaigns.
    Query params: category (substring), minBudget (integer)
    Each result includes isAcceptedByUser flag.
    """
    user_id = int(get_jwt_identity())
    influencer = _get_influencer(user_id)
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404

    category = request.args.get('category', '').strip()
    min_budget = request.args.get('minBudget', type=int)

    query = Campaign.query.filter_by(is_public=True, is_flagged=False)

    if category:
        query = query.filter(Campaign.category.ilike(f'%{category}%'))
    if min_budget is not None:
        query = query.filter(Campaign.budget >= min_budget)

    campaigns = query.all()

    # IDs the current influencer has already accepted
    accepted_ids = {c.id for c in influencer.accepted_campaigns.all()}

    result = []
    for c in campaigns:
        data = c.to_dict()
        # Include sponsor info for the frontend card
        if c.sponsor and c.sponsor.user:
            data['Sponsor'] = {
                'id': c.sponsor.id,
                'companyName': c.sponsor.company_name,
                'industry': c.sponsor.industry,
                'budget': c.sponsor.budget,
                'User': {'id': c.sponsor.user.id, 'name': c.sponsor.user.name}
            }
        data['isAcceptedByUser'] = c.id in accepted_ids
        result.append(data)

    return jsonify(result), 200


@influencer_bp.route('/campaigns/<int:campaign_id>/accept', methods=['POST'])
@influencer_required()
def accept_campaign(campaign_id):
    """Add the influencer to the AcceptedCampaigns junction table."""
    user_id = int(get_jwt_identity())
    influencer = _get_influencer(user_id)
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404

    campaign = Campaign.query.get(campaign_id)
    if not campaign or not campaign.is_public:
        return jsonify({'message': 'Campaign not found or not public'}), 404

    # Check for duplicate acceptance
    already = influencer.accepted_campaigns.filter_by(id=campaign_id).first()
    if already:
        return jsonify({'message': 'You have already accepted this campaign'}), 400

    influencer.accepted_campaigns.append(campaign)
    db.session.commit()
    return jsonify({'message': 'Campaign accepted'}), 200


@influencer_bp.route('/ad-requests', methods=['GET'])
@influencer_required()
def get_ad_requests():
    """
    Returns ad requests that belong to campaigns this influencer has accepted.
    Includes Campaign + Sponsor data for frontend display.
    """
    user_id = int(get_jwt_identity())
    influencer = _get_influencer(user_id)
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404

    accepted_campaign_ids = [c.id for c in influencer.accepted_campaigns.all()]
    if not accepted_campaign_ids:
        return jsonify([]), 200

    ad_requests = (
        AdRequest.query
        .filter(AdRequest.campaign_id.in_(accepted_campaign_ids))
        .order_by(AdRequest.created_at.desc())
        .all()
    )

    result = []
    for ar in ad_requests:
        data = ar.to_dict(include_campaign=True)
        result.append(data)

    return jsonify(result), 200


@influencer_bp.route('/ad-requests/<int:request_id>/<action>', methods=['POST'])
@influencer_required()
def handle_ad_request(request_id, action):
    """
    Accept or reject an ad request.
    :action: 'accept' | 'reject'
    """
    if action not in ('accept', 'reject'):
        return jsonify({'message': 'Invalid action — use accept or reject'}), 400

    user_id = int(get_jwt_identity())
    influencer = _get_influencer(user_id)
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404

    ad_request = AdRequest.query.get(request_id)
    if not ad_request:
        return jsonify({'message': 'Ad request not found'}), 404

    if ad_request.status != 'pending':
        return jsonify({'message': f'Cannot {action} — request is already {ad_request.status}'}), 400

    # If already assigned to a different influencer, block
    if ad_request.influencer_id and ad_request.influencer_id != influencer.id:
        return jsonify({'message': 'Not authorized to modify this request'}), 403

    status_map = {'accept': 'accepted', 'reject': 'rejected'}
    ad_request.status = status_map[action]

    # Assign this influencer if not already set
    if action == 'accept' and not ad_request.influencer_id:
        ad_request.influencer_id = influencer.id

    db.session.commit()
    return jsonify({'message': f'Ad request {action}ed successfully'}), 200
