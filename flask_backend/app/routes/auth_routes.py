"""
Authentication routes — register, login, profile.
Mirrors the original /api/auth Express endpoints.

POST /api/auth/register   — create Sponsor or Influencer account
POST /api/auth/login      — returns JWT access token
GET  /api/auth/profile    — returns authenticated user record
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer
from app.utils.files import save_profile_image

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Accepts multipart/form-data (so profile images can be included).
    Required fields: name, email, password, role
    Sponsor extras:    company, industry, budget
    Influencer extras: category, niche, reach, profileImage (file)
    """
    # Support both JSON and multipart/form-data
    data = request.form.to_dict() if request.content_type and 'multipart' in request.content_type \
        else (request.get_json(silent=True) or {})

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', '').strip()

    if not all([name, email, password, role]):
        return jsonify({'message': 'name, email, password, and role are required'}), 400

    if role not in ('sponsor', 'influencer'):
        return jsonify({'message': 'role must be sponsor or influencer'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    try:
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # get user.id before committing

        if role == 'sponsor':
            company = data.get('company', '').strip()
            industry = data.get('industry', '').strip()
            budget = data.get('budget')
            if not company:
                raise ValueError('companyName is required for sponsors')
            sponsor = Sponsor(
                user_id=user.id,
                company_name=company,
                industry=industry,
                budget=int(budget) if budget else None
            )
            db.session.add(sponsor)

        elif role == 'influencer':
            category = data.get('category', '').strip()
            niche = data.get('niche', '').strip()
            reach = data.get('reach')
            if not category:
                raise ValueError('category is required for influencers')

            # Handle profile image upload
            image_filename = None
            if 'profileImage' in request.files:
                image_filename = save_profile_image(request.files['profileImage'])

            influencer = Influencer(
                user_id=user.id,
                category=category,
                niche=niche,
                reach=int(reach) if reach else None,
                profile_image_url=image_filename
            )
            db.session.add(influencer)

        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201

    except ValueError as ve:
        db.session.rollback()
        return jsonify({'message': str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Body: { email, password }
    Returns: { token, user }
    """
    body = request.get_json(silent=True) or {}
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')

    if not email or not password:
        return jsonify({'message': 'email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 400

    # Embed role into token claims so RBAC decorators can read it
    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'userId': user.id}
    )
    return jsonify({'message': 'Login successful', 'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Returns the authenticated user's base User record."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
