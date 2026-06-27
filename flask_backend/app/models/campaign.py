"""
Campaign model — created and owned by a Sponsor.
Supports public/private visibility and flagging by admin.
"""
from datetime import datetime, timezone
from app import db


class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sponsor_id = db.Column(
        db.Integer,
        db.ForeignKey('sponsors.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(255))
    budget = db.Column(db.Integer)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    is_flagged = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    sponsor = db.relationship('Sponsor', back_populates='campaigns')
    ad_requests = db.relationship('AdRequest', back_populates='campaign', cascade='all, delete-orphan')
    accepted_influencers = db.relationship(
        'Influencer',
        secondary='accepted_campaigns',
        back_populates='accepted_campaigns',
        lazy='dynamic'
    )

    def to_dict(self, include_influencers: bool = False) -> dict:
        data = {
            'id': self.id,
            'sponsorId': self.sponsor_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'budget': self.budget,
            'isPublic': self.is_public,
            'isFlagged': self.is_flagged,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
        if include_influencers:
            data['acceptedInfluencers'] = [
                {
                    'influencerId': inf.id,
                    'influencerName': inf.user.name if inf.user else None
                }
                for inf in self.accepted_influencers
            ]
        return data

    def __repr__(self) -> str:
        return f'<Campaign {self.title!r}>'
