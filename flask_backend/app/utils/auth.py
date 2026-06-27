"""
RBAC decorators — wrap Flask-JWT-Extended's jwt_required with role checks.

Usage:
    @admin_required()
    @sponsor_required()
    @influencer_required()
    @roles_required('admin', 'sponsor')   # any of the listed roles
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def _role_guard(*allowed_roles):
    """Return a decorator that checks the JWT claim 'role' against allowed_roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get('role', '')
            if role not in allowed_roles:
                return jsonify({'message': 'Access forbidden: insufficient role'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required():
    return _role_guard('admin')


def sponsor_required():
    return _role_guard('sponsor')


def influencer_required():
    return _role_guard('influencer')


def roles_required(*roles):
    return _role_guard(*roles)
