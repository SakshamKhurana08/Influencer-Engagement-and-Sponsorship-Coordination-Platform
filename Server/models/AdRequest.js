const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./Campaign');
const Influencer = require('./Influencer');

const AdRequest = sequelize.define('AdRequest', {
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'negotiation'),
    defaultValue: 'pending'
  },
  message: {
    type: DataTypes.TEXT
  },
  proposedTerms: {
    type: DataTypes.TEXT
  }
});

AdRequest.belongsTo(Campaign, { foreignKey: 'campaignId', onDelete: 'CASCADE' });
AdRequest.belongsTo(Influencer, { foreignKey: 'influencerId', onDelete: 'CASCADE' });

Campaign.hasMany(AdRequest, { foreignKey: 'campaignId' });
Influencer.hasMany(AdRequest, { foreignKey: 'influencerId' });

module.exports = AdRequest;
