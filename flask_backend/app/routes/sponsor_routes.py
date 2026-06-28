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
from app.utils.schemas import validate_schema, SponsorProfileSchema
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

    cleaned, errors = validate_schema(SponsorProfileSchema(), body)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 422

    name         = cleaned['name']
    company_name = cleaned['companyName']
    industry     = cleaned['industry']
    budget       = cleaned['budget']

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
