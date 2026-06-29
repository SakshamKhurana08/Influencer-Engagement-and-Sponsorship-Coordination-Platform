"""
Influencer model — profile record for users with role='influencer'.
Includes many-to-many with Campaign via AcceptedCampaigns junction table.
"""
from datetime import datetime, timezone
from app import db

# ── Junction table: accepted campaigns (many-to-many) ─────────────────────────
accepted_campaigns = db.Table(
    'accepted_campaigns',
    db.Column(
        'influencer_id',
        db.Integer,
        db.ForeignKey('influencers.id', ondelete='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'campaign_id',
        db.Integer,
        db.ForeignKey('campaigns.id', ondelete='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'accepted_at',
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
)


class Influencer(db.Model):
    __tablename__ = 'influencers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True
    )
    category = db.Column(db.String(255), nullable=False)
    niche = db.Column(db.String(255))
    reach = db.Column(db.Integer)
    profile_image_url = db.Column(db.Text)  # stores base64 data URI

    # ── Relationships ─────────────────────────────────────────────────────────
    user = db.relationship('User', back_populates='influencer')
    ad_requests = db.relationship('AdRequest', back_populates='influencer', cascade='all, delete-orphan')
    accepted_campaigns = db.relationship(
        'Campaign',
        secondary=accepted_campaigns,
        back_populates='accepted_influencers',
        lazy='dynamic'
    )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'userId': self.user_id,
            'category': self.category,
            'niche': self.niche,
            'reach': self.reach,
            'profileImageUrl': self.profile_image_url,
        }

    def __repr__(self) -> str:
        return f'<Influencer id={self.id}>'
