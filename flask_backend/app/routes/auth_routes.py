"""
Authentication routes — register, login, profile.
Mirrors the original /api/auth Express endpoints.

POST /api/auth/register   — create Sponsor or Influencer account
POST /api/auth/login      — returns JWT access token
GET  /api/auth/profile    — returns authenticated user record
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db, limiter
from app.utils.email import send_email, make_token, verify_token
from app.utils.email_templates import verification_email, admin_new_registration_email
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer
from app.utils.files import save_profile_image
from app.utils.schemas import validate_schema, RegisterSchema, LoginSchema

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@limiter.limit('10 per minute')
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

    cleaned, errors = validate_schema(RegisterSchema(), data)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 422

    name     = cleaned['name'].strip()
    email    = cleaned['email'].strip().lower()
    password = cleaned['password']
    role     = cleaned['role']

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    try:
        user = User(name=name, email=email, role=role, status='pending')
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # get user.id before committing

        if role == 'sponsor':
            company = cleaned.get('company') or data.get('company', '').strip()
            industry = cleaned.get('industry') or data.get('industry', '').strip()
            budget = cleaned.get('budget') or data.get('budget')
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
            category = cleaned.get('category') or data.get('category', '').strip()
            niche = cleaned.get('niche') or data.get('niche', '').strip()
            reach = cleaned.get('reach') or data.get('reach')
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

        # ── Send verification email ───────────────────────────────────────
        try:
            from flask import current_app
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
            admin_email  = current_app.config.get('ADMIN_EMAIL', '')
            token        = make_token({'user_id': user.id}, salt='email-verify', expires_sec=86400)
            verify_url   = f'{frontend_url}/verify-email?token={token}'
            admin_url    = f'{frontend_url}/admin-dashboard?tab=pending'
            send_email(user.email, 'Verify your Cofluence email', verification_email(name, verify_url))
            if admin_email:
                send_email(admin_email, 'New registration awaiting approval',
                           admin_new_registration_email(name, role, admin_url))
        except Exception:
            pass  # email failure must never break registration

        return jsonify({
            'message': 'Registration submitted. Check your email to verify your address.',
            'user': user.to_dict()
        }), 202

    except ValueError as ve:
        db.session.rollback()
        return jsonify({'message': str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
@limiter.limit('20 per minute')
def login():
    """
    Body: { email, password }
    Returns: { token, user }
    """
    body = request.get_json(silent=True) or {}
    cleaned, errors = validate_schema(LoginSchema(), body)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 422

    email    = cleaned['email'].strip().lower()
    password = cleaned['password']

    if not email or not password:
        return jsonify({'message': 'email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 400

    if not user.email_verified:
        return jsonify({'message': 'Please verify your email first. Check your inbox for the verification link.'}), 403

    if user.status == 'pending':
        return jsonify({'message': 'Your account is pending admin approval. You will be notified once approved.'}), 403

    # Embed role into token claims so RBAC decorators can read it
    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'userId': user.id}
    )
    return jsonify({'message': 'Login successful', 'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """
    Body: { token }
    Verifies the email confirmation token sent during registration.
    Sets email_verified = True on success.
    """
    body  = request.get_json(silent=True) or {}
    token = body.get('token', '').strip()

    if not token:
        return jsonify({'message': 'Token is required.'}), 400

    payload = verify_token(token, salt='email-verify', max_age=86400)
    if payload is None:
        return jsonify({'message': 'This link has expired or is invalid. Please register again.'}), 400

    user = db.session.get(User, payload.get('user_id'))
    if not user:
        return jsonify({'message': 'User not found.'}), 404

    if not user.email_verified:
        user.email_verified = True
        db.session.commit()

    return jsonify({'message': 'Email verified. Your account is now under admin review.'}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Returns the authenticated user's base User record."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
