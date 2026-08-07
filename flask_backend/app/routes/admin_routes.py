"""
Admin routes — all protected by admin_required() RBAC guard.

GET    /api/admin/ongoing-campaigns   — campaigns with active ad requests
GET    /api/admin/flagged             — flagged campaigns
POST   /api/admin/flag                — flag a user or campaign
DELETE /api/admin/remove              — remove a user or campaign
GET    /api/admin/search?query=       — search users + campaigns
GET    /api/admin/stats               — platform-wide counts (admins excluded)
GET    /api/admin/users               — all non-admin users with full profile details
GET    /api/admin/export/campaigns    — download all campaigns as CSV
GET    /api/admin/export/users        — download all users as CSV
"""
import csv
import io
from flask import Blueprint, request, jsonify, Response
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
        campaign = db.session.get(Campaign, entity_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        campaign.is_flagged = True
    elif entity_type == 'user':
        user = db.session.get(User, entity_id)
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
        campaign = db.session.get(Campaign, entity_id)
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        db.session.delete(campaign)
    elif entity_type == 'user':
        user = db.session.get(User, entity_id)
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
    """Return platform-wide aggregate counts. Admins and pending users excluded."""
    active_non_admin = User.query.filter(User.role != 'admin', User.status == 'active')
    return jsonify({
        'users':            active_non_admin.count(),
        'sponsors':         Sponsor.query.join(User).filter(User.status == 'active').count(),
        'influencers':      Influencer.query.join(User).filter(User.status == 'active').count(),
        'campaigns':        Campaign.query.count(),
        'adRequests':       AdRequest.query.count(),
        'flaggedUsers':     active_non_admin.filter(User.is_flagged == True).count(),
        'flaggedCampaigns': Campaign.query.filter_by(is_flagged=True).count(),
        'pendingApprovals': User.query.filter(User.role != 'admin', User.status == 'pending').count(),
    }), 200


@admin_bp.route('/pending', methods=['GET'])
@admin_required()
def get_pending():
    """Return all users awaiting approval with full profile details."""
    users = User.query.filter(User.role != 'admin', User.status == 'pending').order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        entry = {
            'id':         u.id,
            'name':       u.name,
            'email':      u.email,
            'role':       u.role,
            'status':     u.status,
            'created_at': u.created_at.strftime('%Y-%m-%d %H:%M') if u.created_at else '',
        }
        if u.role == 'influencer' and u.influencer:
            entry['category'] = u.influencer.category
            entry['niche']    = u.influencer.niche
            entry['reach']    = u.influencer.reach
        elif u.role == 'sponsor' and u.sponsor:
            entry['company']  = u.sponsor.company_name
            entry['industry'] = u.sponsor.industry
            entry['budget']   = u.sponsor.budget
        result.append(entry)
    return jsonify(result), 200


@admin_bp.route('/approve/<int:user_id>', methods=['POST'])
@admin_required()
def approve_user(user_id):
    """Approve a pending registration — sets status to active."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.status != 'pending':
        return jsonify({'error': 'User is not pending approval'}), 400
    user.status = 'active'
    db.session.commit()
    cache.delete('admin_stats')
    return jsonify({'message': f'{user.name} approved successfully'}), 200


@admin_bp.route('/reject/<int:user_id>', methods=['DELETE'])
@admin_required()
def reject_user(user_id):
    """Reject and delete a pending registration."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.status != 'pending':
        return jsonify({'error': 'User is not pending approval'}), 400
    db.session.delete(user)
    db.session.commit()
    cache.delete('admin_stats')
    return jsonify({'message': 'Registration rejected and removed'}), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    """
    Return all non-admin users with full profile details for admin management.
    Query params:
      role   — filter by 'influencer' or 'sponsor'
      search — search by name or email
    """
    role_filter   = request.args.get('role', '').strip()
    search_filter = request.args.get('search', '').strip()

    query = User.query.filter(User.role != 'admin', User.status == 'active')

    if role_filter in ('influencer', 'sponsor'):
        query = query.filter_by(role=role_filter)

    if search_filter:
        pattern = f'%{search_filter}%'
        query = query.filter(
            db.or_(User.name.ilike(pattern), User.email.ilike(pattern))
        )

    users = query.all()
    result = []
    for u in users:
        entry = {
            'id':         u.id,
            'name':       u.name,
            'email':      u.email,
            'role':       u.role,
            'is_flagged': u.is_flagged,
            'created_at': u.created_at.strftime('%Y-%m-%d') if u.created_at else '',
        }
        if u.role == 'influencer' and u.influencer:
            entry['category']  = u.influencer.category
            entry['niche']     = u.influencer.niche
            entry['reach']     = u.influencer.reach
        elif u.role == 'sponsor' and u.sponsor:
            entry['company']   = u.sponsor.company_name
            entry['industry']  = u.sponsor.industry
            entry['budget']    = u.sponsor.budget
        result.append(entry)

    return jsonify(result), 200


@admin_bp.route('/export/campaigns', methods=['GET'])
@admin_required()
def export_campaigns():
    """Download all campaigns as a CSV file."""
    campaigns = Campaign.query.join(Sponsor).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'title', 'category', 'budget', 'is_public',
                     'is_flagged', 'sponsor_company', 'created_at'])

    for c in campaigns:
        writer.writerow([
            c.id,
            c.title,
            c.category or '',
            c.budget or '',
            c.is_public,
            c.is_flagged,
            c.sponsor.company_name if c.sponsor else '',
            c.created_at.strftime('%Y-%m-%d %H:%M') if c.created_at else '',
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=campaigns.csv'}
    )


@admin_bp.route('/export/users', methods=['GET'])
@admin_required()
def export_users():
    """Download all users as a CSV file."""
    users = User.query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'name', 'email', 'role', 'is_flagged', 'created_at'])

    for u in users:
        writer.writerow([
            u.id,
            u.name,
            u.email,
            u.role,
            u.is_flagged,
            u.created_at.strftime('%Y-%m-%d %H:%M') if u.created_at else '',
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=users.csv'}
    )
