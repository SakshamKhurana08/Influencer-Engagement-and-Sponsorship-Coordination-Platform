const { Campaign, Sponsor, User, AdRequest, Influencer } = require('../models');
const { Op } = require('sequelize');

exports.getOngoingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        {
          model: AdRequest,
          where: {
            status: ['pending', 'accepted']
          },
          required: true
        }
      ]
    });

    const data = campaigns.map(c => ({
      name: c.title,
      progress: `${Math.floor(Math.random() * 100)}%` 
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching ongoing campaigns:", error);
    res.status(500).json({ error: "Failed to fetch ongoing campaigns" });
  }
};

exports.getFlaggedCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { isFlagged: true },
      include: [
        {
          model: Sponsor,
          attributes: ['companyName']
        }
      ]
    });

    const data = campaigns.map(c => ({
      name: c.title,
      company: c.Sponsor?.companyName || 'Unknown'
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching flagged campaigns:", error);
    res.status(500).json({ error: "Failed to fetch flagged campaigns" });
  }
};

exports.flagUserOrCampaign = async (req, res) => {
  const { type, id } = req.body;

  try {
    if (type === 'campaign') {
      await Campaign.update({ isFlagged: true }, { where: { id } });
    } else if (type === 'user') {
      await User.update({ isFlagged: true }, { where: { id } });
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    res.json({ message: `${type} flagged successfully.` });
  } catch (error) {
    console.error("Error flagging:", error);
    res.status(500).json({ error: "Failed to flag entity" });
  }
};

exports.removeUserOrCampaign = async (req, res) => {
  const { type, id } = req.body;

  try {
    if (type === 'campaign') {
      await Campaign.destroy({ where: { id } });
    } else if (type === 'user') {
      await User.destroy({ where: { id } });
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    res.json({ message: `${type} removed successfully.` });
  } catch (error) {
    console.error("Error removing entity:", error);
    res.status(500).json({ error: "Failed to remove entity" });
  }
};

exports.searchEntities = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.findAll({
      where: {
        name: { [Op.like]: `%${query}%` }
      },
      attributes: ['id', 'name', 'email', 'role']
    });

    const campaigns = await Campaign.findAll({
      where: {
        title: { [Op.like]: `%${query}%` }
      },
      attributes: ['id', 'title', 'category']
    });

    res.json({ users, campaigns });
  } catch (error) {
    console.error("Error searching entities:", error);
    res.status(500).json({ error: "Failed to search entities" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const sponsorCount = await Sponsor.count();
    const influencerCount = await Influencer.count();
    const campaignCount = await Campaign.count();
    const requestCount = await AdRequest.count();

    res.json({
      users: userCount,
      sponsors: sponsorCount,
      influencers: influencerCount,
      campaigns: campaignCount,
      adRequests: requestCount
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
