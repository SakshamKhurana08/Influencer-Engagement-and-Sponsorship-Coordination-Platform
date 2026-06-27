"""
Sponsor routes — protected by sponsor_required() RBAC guard.

GET /api/sponsors/details   — get Sponsor record only
GET /api/sponsors/profile   — get Sponsor + User combined
PUT /api/sponsors/profile   — update name, company, industry, budget
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models.user import User
from app.models.sponsor import Sponsor
from app.utils.auth import sponsor_required

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
    user = User.query.get(user_id)
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

    name = body.get('name', '').strip()
    company_name = body.get('companyName', '').strip()
    industry = body.get('industry', '').strip()
    budget = body.get('budget')

    if not all([name, company_name, industry, budget]):
        return jsonify({'message': 'name, companyName, industry, and budget are required'}), 400

    user = User.query.get(user_id)
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
