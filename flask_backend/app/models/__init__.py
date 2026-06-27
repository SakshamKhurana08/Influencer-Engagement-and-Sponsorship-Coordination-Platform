"""
Models package — imports all models so Flask-Migrate can detect them.
"""
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.influencer import Influencer, accepted_campaigns
from app.models.campaign import Campaign
from app.models.ad_request import AdRequest

__all__ = ['User', 'Sponsor', 'Influencer', 'Campaign', 'AdRequest', 'accepted_campaigns']
