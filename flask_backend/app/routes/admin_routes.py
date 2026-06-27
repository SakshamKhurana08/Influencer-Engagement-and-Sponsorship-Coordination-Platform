"""
Admin routes — all protected by admin_required() RBAC guard.

GET    /api/admin/ongoing-campaigns   — campaigns with active ad requests
GET    /api/admin/flagged             — flagged campaigns
POST   /api/admin/flag                — flag a user or campaign
DELETE /api/admin/remove              — remove a user or campaign
GET    /api/admin/search?query=       — search users + campaigns
GET    /api/admin/stats               — platform-wide counts
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db, cache
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest
from app.utils.auth import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/ongoing-campaigns', methods=['GET'])
@admin_required()
def ongoing_campaigns():
    """Return campaigns that have at least one pending or accepted ad request."""
    campaigns = (
        db.session.query(Campaign)
        .join(AdRequest, AdRequest.campaign_id == Campaign.id)
        .filter(AdRequest.status.in_(['pending', 'accepted']))
        .distinct()
        .all()
    )

    # Real progress: ratio of accepted ad requests to total ad requests
    result = []
    for c in campaigns:
        total = db.session.query(AdRequest).filter_by(campaign_id=c.id).count()
        accepted = db.session.query(AdRequest).filter_by(campaign_id=c.id, status='accepted').count()
        progress = f"{int((accepted / total) * 100)}%" if total else "0%"
        result.append({'id': c.id, 'name': c.title, 'progress': progress})

    return jsonify(result), 200


@admin_bp.route('/flagged', methods=['GET'])
@admin_required()
def flagged_entities():
    """Return all flagged campaigns."""
    campaigns = (
        Campaign.query
        .filter_by(is_flagged=True)
        .join(Sponsor, Sponsor.id == Campaign.sponsor_id)
        .all()
    )
    data = [
        {'id': c.id, 'name': c.title, 'company': c.sponsor.company_name if c.sponsor else 'Unknown'}
        for c in campaigns
    ]
    return jsonify(data), 200


@admin_bp.route('/flag', methods=['POST'])
@admin_required()
def flag_entity():
    """
    Body: { type: 'user'|'campaign', id: <int> }
    Sets isFlagged = true on the target.
    """
    body = request.get_json(silent=True) or {}
    entity_type = body.get('type')
    entity_id = body.get('id')

    if not entity_type or not entity_id:
        return jsonify({'error': 'type and id are required'}), 400

    if entity_type == 'campaign':
        campaign = Campaign.query.get(entity_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        campaign.is_flagged = True
    elif entity_type == 'user':
        user = User.query.get(entity_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.is_flagged = True
    else:
        return jsonify({'error': 'type must be user or campaign'}), 400

    db.session.commit()
    cache.delete('admin_stats')
    return jsonify({'message': f'{entity_type} flagged successfully'}), 200


@admin_bp.route('/remove', methods=['DELETE'])
@admin_required()
def remove_entity():
    """
    Body: { type: 'user'|'campaign', id: <int> }
    Permanently deletes the target (cascade handles related rows).
    """
    body = request.get_json(silent=True) or {}
    entity_type = body.get('type')
    entity_id = body.get('id')

    if not entity_type or not entity_id:
        return jsonify({'error': 'type and id are required'}), 400

    if entity_type == 'campaign':
        campaign = Campaign.query.get(entity_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        db.session.delete(campaign)
    elif entity_type == 'user':
        user = User.query.get(entity_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        db.session.delete(user)
    else:
        return jsonify({'error': 'type must be user or campaign'}), 400

    db.session.commit()
    cache.delete('admin_stats')
    return jsonify({'message': f'{entity_type} removed successfully'}), 200


@admin_bp.route('/search', methods=['GET'])
@admin_required()
def search_entities():
    """
    Query param: query=<string>
    Returns matching users (by name) and campaigns (by title).
    """
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'users': [], 'campaigns': []}), 200

    pattern = f'%{query}%'

    users = User.query.filter(User.name.ilike(pattern)).all()
    campaigns = Campaign.query.filter(Campaign.title.ilike(pattern)).all()

    return jsonify({
        'users': [{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role} for u in users],
        'campaigns': [{'id': c.id, 'title': c.title, 'category': c.category} for c in campaigns]
    }), 200


@admin_bp.route('/stats', methods=['GET'])
@admin_required()
@cache.cached(timeout=60, key_prefix='admin_stats')
def get_stats():
    """Return platform-wide aggregate counts."""
    return jsonify({
        'users': User.query.count(),
        'sponsors': Sponsor.query.count(),
        'influencers': Influencer.query.count(),
        'campaigns': Campaign.query.count(),
        'adRequests': AdRequest.query.count(),
        'flaggedUsers': User.query.filter_by(is_flagged=True).count(),
        'flaggedCampaigns': Campaign.query.filter_by(is_flagged=True).count(),
    }), 200
