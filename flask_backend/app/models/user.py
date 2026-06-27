"""
User model — base authentication table shared by all roles.

Columns match the original MySQL schema exactly so that the React
frontend data contracts remain unchanged.
"""
import bcrypt
from datetime import datetime, timezone
from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('admin', 'sponsor', 'influencer', name='user_role_enum'),
        nullable=False
    )
    is_flagged = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    sponsor = db.relationship('Sponsor', back_populates='user', uselist=False, cascade='all, delete-orphan')
    influencer = db.relationship('Influencer', back_populates='user', uselist=False, cascade='all, delete-orphan')

    # ── Password helpers ──────────────────────────────────────────────────────
    def set_password(self, plain: str) -> None:
        """Hash and store the password using bcrypt."""
        self.password = bcrypt.hashpw(
            plain.encode('utf-8'), bcrypt.gensalt(rounds=10)
        ).decode('utf-8')

    def check_password(self, plain: str) -> bool:
        """Verify a plain-text password against the stored hash."""
        return bcrypt.checkpw(plain.encode('utf-8'), self.password.encode('utf-8'))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'isFlagged': self.is_flagged,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f'<User {self.email} [{self.role}]>'
