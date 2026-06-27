const { Op } = require('sequelize');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const AdRequest = require('../models/AdRequest');
const Campaign = require('../models/Campaign');
const { Sponsor } = require('../models');

const getProfile = async (req, res) => {  
    try {
        const influencer = await Influencer.findOne({ where: { userId: req.user.userId } });

        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        const user = await User.findByPk(req.user.userId); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ influencer, user });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { name, category, niche, reach } = req.body;

    if (!name || !category || !niche || !reach) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Update User's name
        await User.update({ name }, { where: { id: req.user.userId } });

        // Update Influencer fields
        await Influencer.update({ category, niche, reach }, {
            where: { userId: req.user.userId }
        });

        // Fetch updated records to return
        const updatedUser = await User.findByPk(req.user.userId);
        const updatedInfluencer = await Influencer.findOne({
            where: { userId: req.user.userId }
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
            influencer: updatedInfluencer
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/influencer/ad-requests
const getAdRequests = async (req, res) => {
    try {
        // Step 1: Get influencer by userId from req.user
        const influencer = await Influencer.findOne({ where: { userId: req.user.userId } });
        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        const influencerId = influencer.id;

        // Step 2: Find campaigns accepted by this influencer
        const acceptedCampaigns = await influencer.getCampaigns(); // uses belongsToMany

        const acceptedCampaignIds = acceptedCampaigns.map(c => c.id);

        if (acceptedCampaignIds.length === 0) {
            return res.status(404).json({ message: 'No accepted campaigns for this influencer' });
        }

        // Step 3: Fetch AdRequests only for those campaigns
        const adRequests = await AdRequest.findAll({
            where: {
                campaignId: acceptedCampaignIds, // Fetch ad requests for accepted campaigns
            },
            include: [
                {
                    model: Campaign,
                    required: true, // Ensures the ad request has a valid campaign
                    include: [
                        {
                            model: Sponsor, // Include sponsor details from the Campaign
                            required: true, // Ensures that the campaign has a sponsor
                            attributes: ['id', 'companyName', 'industry', 'budget'] // Choose the relevant sponsor fields to include
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] // Order by creation date
        });

        res.json(adRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/influencer/ad-requests/:id/:action
const handleAdRequest = async (req, res) => {
    const { id, action } = req.params;
    const validActions = ['accept', 'reject'];

    // Validate action type
    if (!validActions.includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
    }

    try {
        // Step 1: Get influencer using userId from the JWT
        const influencer = await Influencer.findOne({ where: { userId: req.user.userId } });

        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        // Step 2: Find the ad request by ID (no influencer filter here)
        const request = await AdRequest.findOne({ where: { id } });

        if (!request) {
            return res.status(404).json({ message: 'Ad request not found' });
        }

        // Step 3: Prevent status change if already processed
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Cannot ${action} this request, it is already ${request.status}` });
        }

        // Step 4: If influencer already assigned and it's not the current one, block it
        if (request.influencerId && request.influencerId !== influencer.id) {
            return res.status(403).json({ message: 'You are not authorized to modify this request.' });
        }

        // Step 5: On 'accept', assign influencerId if not already set
if (action === 'accept' && !request.influencerId) {
    request.influencerId = influencer.id;
}

// Step 6: Map action to proper status string
const statusMap = {
    accept: 'accepted',
    reject: 'rejected',
    negotiate: 'negotiated'
};

request.status = statusMap[action];
await request.save();

        res.json({ message: `Ad request ${action}ed successfully` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// GET /api/campaigns
const getPublicCampaigns = async (req, res) => {
    const { category, minBudget } = req.query;

    try {
        // ✅ Fetch influencer using the userId from req.user
        const influencer = await Influencer.findOne({ where: { userId: req.user.userId } });

        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        const influencerId = influencer.id;

        const where = {
            isPublic: true,
        };

        if (category) where.category = { [Op.like]: `%${category}%` };
        if (minBudget) where.budget = { [Op.gte]: Number(minBudget) };

        const campaigns = await Campaign.findAll({
            where,
            include: [
                {
                    model: Sponsor,
                    required: true,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Influencer,
                    where: { id: influencerId },
                    required: false, // ✅ allow campaigns without this influencer
                    attributes: ['id']
                }
            ]
        });

        const result = campaigns.map(c => {
            const json = c.toJSON();
            json.isAcceptedByUser = json.Influencers && json.Influencers.some(i => i.id === influencerId);
            delete json.Influencers; // ✅ remove raw influencer data if not needed
            return json;
        });

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/influencer/campaigns/:id/accept
const acceptCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the campaign by its primary key
        const campaign = await Campaign.findByPk(id, {
            include: [
                {
                    model: Sponsor, 
                    as: 'sponsor' // Include sponsor data (optional)
                }
            ]
        });

        if (!campaign || !campaign.isPublic) {
            return res.status(404).json({ message: 'Campaign not found or not public' });
        }

        // Fetch influencer using the userId from req.user
        const influencer = await Influencer.findOne({ where: { userId: req.user.userId } });

        if (!influencer) {
            return res.status(404).json({ message: 'Influencer not found' });
        }

        // Check if the influencer has already accepted this campaign
        const influencerExists = await campaign.hasInfluencer(influencer.id);
        if (influencerExists) {
            return res.status(400).json({ message: 'You have already accepted this campaign' });
        }

        // Record the influencer acceptance using the junction table `AcceptedCampaigns`
        await campaign.addInfluencer(influencer.id, { through: { acceptedAt: new Date() } });

        res.json({ message: 'Campaign accepted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


module.exports = { getProfile, updateProfile, getPublicCampaigns, acceptCampaign, getAdRequests, handleAdRequest };