const Campaign = require('../models/Campaign');
const AdRequest = require('../models/AdRequest');
const User = require('../models/User');
const Sponsor = require('../models/Sponsor');
const Influencer = require('../models/Influencer');
const { Op } = require('sequelize');

const getAllMyCampaigns = async (req, res) => {
    try {
        const userId = req.user.userId;

        const campaigns = await Campaign.findAll({
            where: { userId },
            include: [
                {
                    model: Influencer,
                    as: 'Influencers', 
                    through: { attributes: [] },
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['name'] 
                        }
                    ]
                }
            ]
        });

        const formattedCampaigns = campaigns.map(campaign => {
            const json = campaign.toJSON();
            json.acceptedInfluencers = json.Influencers.map(influencer => {
                return {
                    influencerId: influencer.id,
                    influencerName: influencer.User.name 
                };
            }) || [];
            delete json.Influencers;
            return json;
        });
        
        res.status(200).json(formattedCampaigns);

    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns.' });
    }
};



const createCampaign = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, category, budget, isPublic } = req.body;

        const campaign = await Campaign.create({
            title,
            description,
            category,
            budget,
            isPublic,
            userId
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign.' });
    }
};

const updateCampaign = async (req, res) => {
    try {
        const userId = req.user.userId;
        const campaignId = req.params.id;

        const campaign = await Campaign.findOne({ where: { id: campaignId, userId } });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
        }

        const { title, description, category, budget, isPublic } = req.body;

        await campaign.update({ title, description, category, budget, isPublic });

        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign.' });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const userId = req.user.userId;
        const campaignId = req.params.id;

        const campaign = await Campaign.findOne({ where: { id: campaignId, userId } });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
        }

        await campaign.destroy();

        res.status(200).json({ message: 'Campaign deleted successfully.' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign.' });
    }
};

const createAdRequest = async (req, res) => {
    try {
        const { campaignId } = req.params; 
        const userId = req.user.userId;
        const { influencerId, message, proposedTerms } = req.body;

        const campaign = await Campaign.findOne({ where: { id: campaignId, userId } });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
        }

        const adRequest = await AdRequest.create({
            campaignId,
            influencerId,
            message,
            proposedTerms,
        });

        res.status(201).json(adRequest);
    } catch (error) {
        console.error('Error creating ad request:', error);
        res.status(500).json({ error: 'Failed to create ad request.' });
    }
};

const getAdRequestsForCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user.userId;

        const campaign = await Campaign.findOne({ where: { id: campaignId, userId } });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
        }

        const adRequests = await AdRequest.findAll({ where: { campaignId } });

        res.status(200).json(adRequests);
    } catch (error) {
        console.error('Error fetching ad requests:', error);
        res.status(500).json({ error: 'Failed to fetch ad requests.' });
    }
};

const updateAdRequest = async (req, res) => {
    try {
        const { adRequestId } = req.params;
        const { status, message, proposedTerms } = req.body;
        const userId = req.user.userId;

        const adRequest = await AdRequest.findOne({ where: { id: adRequestId } });
        if (!adRequest) {
            return res.status(404).json({ error: 'Ad request not found.' });
        }

        const campaign = await Campaign.findOne({ where: { id: adRequest.campaignId, userId } });
        if (!campaign) {
            return res.status(403).json({ error: 'Unauthorized to update this ad request.' });
        }

        await adRequest.update({ status, message, proposedTerms });

        res.status(200).json(adRequest);
    } catch (error) {
        console.error('Error updating ad request:', error);
        res.status(500).json({ error: 'Failed to update ad request.' });
    }
};

const deleteAdRequest = async (req, res) => {
    try {
        const { adRequestId } = req.params;
        const userId = req.user.userId;

        const adRequest = await AdRequest.findOne({ where: { id: adRequestId } });
        if (!adRequest) {
            return res.status(404).json({ error: 'Ad request not found.' });
        }

        const campaign = await Campaign.findOne({ where: { id: adRequest.campaignId, userId } });
        if (!campaign) {
            return res.status(403).json({ error: 'Unauthorized to delete this ad request.' });
        }

        await adRequest.destroy();

        res.status(200).json({ message: 'Ad request deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ad request:', error);
        res.status(500).json({ error: 'Failed to delete ad request.' });
    }
};

module.exports = {
    getAllMyCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createAdRequest,
    getAdRequestsForCampaign,
    updateAdRequest,
    deleteAdRequest,
};
