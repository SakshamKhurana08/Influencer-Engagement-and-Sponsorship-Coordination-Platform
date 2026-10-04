"""
Sponsor routes — protected by sponsor_required() RBAC guard.

GET  /api/sponsors/details          — get Sponsor record only
GET  /api/sponsors/profile          — get Sponsor + User combined
PUT  /api/sponsors/profile          — update name, company, industry, budget
GET  /api/sponsors/requests         — all ad requests across sponsor's campaigns
POST /api/sponsors/requests/<id>/respond — accept | reject | negotiate a request
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest
from app.models.influencer import Influencer
from app.utils.auth import sponsor_required
from app.utils.email import send_email
from app.utils.email_templates import ad_request_status_email
from app.utils.schemas import validate_schema, SponsorProfileSchema, InfluencerSearchSchema
from app.utils.files import save_profile_image

sponsor_bp = Blueprint('sponsor', __name__)


def _get_sponsor(user_id: int):
    return Sponsor.query.filter_by(user_id=user_id).first()


@sponsor_bp.route('/details', methods=['GET'])
@sponsor_required()
def get_details():
    """Return the raw Sponsor record for the authenticated user."""
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor(user_id)
    if not sponsor:
        return jsonify({'message': 'Sponsor profile not found'}), 404
    return jsonify(sponsor.to_dict()), 200


@sponsor_bp.route('/profile', methods=['GET'])
@sponsor_required()
def get_profile():
    """Return Sponsor + User combined."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    sponsor = _get_sponsor(user_id)

    if not sponsor:
        return jsonify({'message': 'Sponsor not found'}), 404
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({'sponsor': sponsor.to_dict(), 'user': user.to_dict()}), 200


@sponsor_bp.route('/profile', methods=['PUT'])
@sponsor_required()
def update_profile():
    """Update name, companyName, industry, budget. Email cannot be changed."""
    user_id = int(get_jwt_identity())
    body = request.get_json(silent=True) or {}

    cleaned, errors = validate_schema(SponsorProfileSchema(), body)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 422

    name         = cleaned['name']
    company_name = cleaned['companyName']
    industry     = cleaned['industry']
    budget       = cleaned['budget']

    user = db.session.get(User, user_id)
    sponsor = _get_sponsor(user_id)

    if not user or not sponsor:
        return jsonify({'message': 'Profile not found'}), 404

    # Block email change attempts
    if body.get('email') and body['email'] != user.email:
        return jsonify({'message': 'Email cannot be changed'}), 400

    user.name = name
    sponsor.company_name = company_name
    sponsor.industry = industry
    sponsor.budget = int(budget)

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(),
        'sponsor': sponsor.to_dict()
    }), 200


@sponsor_bp.route('/profile/image', methods=['POST'])
@sponsor_required()
def upload_profile_image():
    """
    Upload or replace sponsor profile image.
    multipart/form-data with field name 'profileImage'.
    Returns updated sponsor record.
    """
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor(user_id)
    if not sponsor:
        return jsonify({'message': 'Sponsor profile not found'}), 404

    if 'profileImage' not in request.files:
        return jsonify({'message': 'profileImage file is required'}), 400

    try:
        filename = save_profile_image(request.files['profileImage'])
    except ValueError as e:
        return jsonify({'message': str(e)}), 400

    sponsor.profile_image_url = filename
    db.session.commit()
    return jsonify({'message': 'Profile image updated', 'sponsor': sponsor.to_dict()}), 200


@sponsor_bp.route('/requests', methods=['GET'])
@sponsor_required()
def get_requests():
    """
    Return all ad requests across all of this sponsor's campaigns.
    Includes influencer profile details and campaign title.
    Optional query param: status=pending|accepted|rejected|negotiation
    """
    user_id  = int(get_jwt_identity())
    sponsor  = _get_sponsor(user_id)
    if not sponsor:
        return jsonify({'message': 'Sponsor not found'}), 404

    status_filter = request.args.get('status', '').strip()

    # Get all campaign IDs belonging to this sponsor
    campaign_ids = [c.id for c in Campaign.query.filter_by(sponsor_id=sponsor.id).all()]
    if not campaign_ids:
        return jsonify([]), 200

    query = AdRequest.query.filter(AdRequest.campaign_id.in_(campaign_ids))
    if status_filter in ('pending', 'accepted', 'rejected', 'negotiation'):
        query = query.filter_by(status=status_filter)

    ads = query.order_by(AdRequest.created_at.desc()).all()

    result = []
    for ad in ads:
        data = ad.to_dict(include_campaign=True)
        # Add influencer details
        if ad.influencer:
            inf_user = db.session.get(User, ad.influencer.user_id)
            data['influencer'] = {
                'id':       ad.influencer.id,
                'name':     inf_user.name if inf_user else 'Unknown',
                'email':    inf_user.email if inf_user else '',
                'category': ad.influencer.category,
                'niche':    ad.influencer.niche,
                'reach':    ad.influencer.reach,
                'profileImageUrl': ad.influencer.profile_image_url,
            }
        result.append(data)

    return jsonify(result), 200


@sponsor_bp.route('/requests/<int:request_id>/respond', methods=['POST'])
@sponsor_required()
def respond_to_request(request_id):
    """
    Sponsor responds to an influencer's ad request.
    Body: { action: 'accept'|'reject'|'negotiate', counterTerms: '...' }
    counterTerms is required when action='negotiate'.
    """
    user_id = int(get_jwt_identity())
    sponsor = _get_sponsor(user_id)
    if not sponsor:
        return jsonify({'message': 'Sponsor not found'}), 404

    ad = db.session.get(AdRequest, request_id)
    if not ad:
        return jsonify({'message': 'Request not found'}), 404

    # Verify this ad belongs to one of the sponsor's campaigns
    campaign = db.session.get(Campaign, ad.campaign_id)
    if not campaign or campaign.sponsor_id != sponsor.id:
        return jsonify({'message': 'Not authorised to respond to this request'}), 403

    body   = request.get_json(silent=True) or {}
    action = body.get('action', '').strip()

    if action not in ('accept', 'reject', 'negotiate'):
        return jsonify({'message': 'action must be accept, reject, or negotiate'}), 400

    if action == 'negotiate':
        counter = body.get('counterTerms', '').strip()
        if not counter:
            return jsonify({'message': 'counterTerms is required for negotiate'}), 400
        ad.status         = 'negotiation'
        ad.proposed_terms = counter
    elif action == 'accept':
        ad.status = 'accepted'
    elif action == 'reject':
        ad.status = 'rejected'

    db.session.commit()

    # Notify influencer that sponsor responded
    try:
        if ad.influencer_id:
            from app.models.influencer import Influencer
            from app.models.user import User
            inf = db.session.get(Influencer, ad.influencer_id)
            inf_user     = db.session.get(User, inf.user_id) if inf else None
            sponsor_user = sponsor.user
            if inf_user and sponsor_user:
                send_email(
                    inf_user.email,
                    f'Update on your request — {campaign.title}',
                    ad_request_status_email(
                        inf_user.name,
                        sponsor.company_name,
                        campaign.title,
                        ad.status
                    )
                )
    except Exception:
        pass

    return jsonify({'message': f'Request {action}ed', 'adRequest': ad.to_dict()}), 200


@sponsor_bp.route('/influencers', methods=['GET'])
@sponsor_required()
def get_influencers():
    """
    Browse/search the influencer directory.
    Query params: category, niche, search (name), minReach, maxReach, page, per_page (max 50).
    Only returns active, non-flagged influencers.
    """
    # Validate query params
    cleaned, errors = validate_schema(InfluencerSearchSchema(), dict(request.args))
    if errors:
        return jsonify({'message': 'Invalid query params', 'errors': errors}), 422

    category = cleaned.get('category', '').strip()
    niche     = cleaned.get('niche', '').strip()
    search    = cleaned.get('search', '').strip()
    min_reach = cleaned.get('minReach')
    max_reach = cleaned.get('maxReach')
    page      = cleaned.get('page', 1)
    per_page  = cleaned.get('per_page', 20)

    query = (
        Influencer.query
        .join(User, User.id == Influencer.user_id)
        .filter(User.status == 'active', User.is_flagged == False)
    )

    if category:
        query = query.filter(Influencer.category.ilike(f'%{category}%'))
    if niche:
        query = query.filter(Influencer.niche.ilike(f'%{niche}%'))
    if search:
        query = query.filter(User.name.ilike(f'%{search}%'))
    if min_reach is not None:
        query = query.filter(Influencer.reach >= min_reach)
    if max_reach is not None:
        query = query.filter(Influencer.reach <= max_reach)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for inf in pagination.items:
        user = db.session.get(User, inf.user_id)
        result.append({
            'id':              inf.id,
            'name':            user.name if user else '',
            'category':        inf.category,
            'niche':           inf.niche,
            'reach':           inf.reach,
            'profileImageUrl': inf.profile_image_url,
        })

    return jsonify({
        'items':    result,
        'total':    pagination.total,
        'page':     page,
        'per_page': per_page,
        'pages':    pagination.pages,
    }), 200
