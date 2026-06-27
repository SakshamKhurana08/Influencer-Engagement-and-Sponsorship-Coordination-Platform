"""
Sponsor model — profile record for users with role='sponsor'.
"""
from app import db


class Sponsor(db.Model):
    __tablename__ = 'sponsors'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True
    )
    company_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(255))
    budget = db.Column(db.Integer)

    # ── Relationships ─────────────────────────────────────────────────────────
    user = db.relationship('User', back_populates='sponsor')
    campaigns = db.relationship('Campaign', back_populates='sponsor', cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'userId': self.user_id,
            'companyName': self.company_name,
            'industry': self.industry,
            'budget': self.budget,
        }

    def __repr__(self) -> str:
        return f'<Sponsor {self.company_name}>'
