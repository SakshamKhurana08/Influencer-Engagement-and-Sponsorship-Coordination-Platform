"""
Marshmallow validation schemas.

Usage in a route:
    from app.utils.schemas import validate, RegisterSchema
    data, errors = validate(RegisterSchema(), request.get_json())
    if errors:
        return jsonify({'errors': errors}), 422
"""
from marshmallow import Schema, fields, validate, ValidationError, EXCLUDE


# ── Helper ────────────────────────────────────────────────────────────────────

def validate_schema(schema_instance, data: dict):
    """
    Validate `data` against `schema_instance`.
    Returns (cleaned_data, errors_dict).
    errors_dict is empty on success.
    """
    try:
        cleaned = schema_instance.load(data or {})
        return cleaned, {}
    except ValidationError as err:
        return {}, err.messages


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name     = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    email    = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role     = fields.Str(required=True, validate=validate.OneOf(['sponsor', 'influencer']))

    # Sponsor fields
    company  = fields.Str(load_default=None)
    industry = fields.Str(load_default=None)
    budget   = fields.Int(load_default=None, validate=validate.Range(min=0))

    # Influencer fields
    category = fields.Str(load_default=None)
    niche    = fields.Str(load_default=None)
    reach    = fields.Int(load_default=None, validate=validate.Range(min=0))


class LoginSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    email    = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=1))


# ── Campaign ──────────────────────────────────────────────────────────────────

class CampaignSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    title       = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(load_default='')
    category    = fields.Str(load_default='', validate=validate.Length(max=255))
    budget      = fields.Int(load_default=None, validate=validate.Range(min=0))
    isPublic    = fields.Bool(load_default=True)


class AdRequestSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    message       = fields.Str(required=True, validate=validate.Length(min=1))
    proposedTerms = fields.Str(load_default='')
    influencerId  = fields.Int(load_default=None)


class AdRequestUpdateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    status        = fields.Str(load_default=None,
                               validate=validate.OneOf(['pending', 'accepted', 'rejected', 'negotiation']))
    message       = fields.Str(load_default=None)
    proposedTerms = fields.Str(load_default=None)


# ── Profile updates ───────────────────────────────────────────────────────────

class SponsorProfileSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name        = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    companyName = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    industry    = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    budget      = fields.Int(required=True, validate=validate.Range(min=0))


class InfluencerProfileSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name     = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    category = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    niche    = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    reach    = fields.Int(required=True, validate=validate.Range(min=0))
