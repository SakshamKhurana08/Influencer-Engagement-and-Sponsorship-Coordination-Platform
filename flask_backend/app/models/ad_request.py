"""
AdRequest model — sent from Sponsor to Influencer for a Campaign.

Status transitions:
  pending → accepted | rejected | negotiation
"""
from datetime import datetime, timezone
from app import db


class AdRequest(db.Model):
    __tablename__ = 'ad_requests'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_id = db.Column(
        db.Integer,
        db.ForeignKey('campaigns.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    influencer_id = db.Column(
        db.Integer,
        db.ForeignKey('influencers.id', ondelete='CASCADE'),
        nullable=True,   # can be NULL until influencer accepts/is assigned
        index=True
    )
    status = db.Column(
        db.Enum('pending', 'accepted', 'rejected', 'negotiation', name='ad_status_enum'),
        default='pending',
        nullable=False
    )
    message = db.Column(db.Text)
    proposed_terms = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    campaign = db.relationship('Campaign', back_populates='ad_requests')
    influencer = db.relationship('Influencer', back_populates='ad_requests')

    def to_dict(self, include_campaign: bool = False) -> dict:
        data = {
            'id': self.id,
            'campaignId': self.campaign_id,
            'influencerId': self.influencer_id,
            'status': self.status,
            'message': self.message,
            'proposedTerms': self.proposed_terms,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
        if include_campaign and self.campaign:
            data['Campaign'] = {
                'id': self.campaign.id,
                'title': self.campaign.title,
                'Sponsor': self.campaign.sponsor.to_dict() if self.campaign.sponsor else None
            }
        return data

    def __repr__(self) -> str:
        return f'<AdRequest campaign={self.campaign_id} status={self.status}>'
