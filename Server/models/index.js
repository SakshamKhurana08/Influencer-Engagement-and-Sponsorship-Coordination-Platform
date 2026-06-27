const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Sponsor = require('./Sponsor');
const Influencer = require('./Influencer');
const Campaign = require('./Campaign');
const AdRequest = require('./AdRequest');

User.hasOne(Sponsor, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Sponsor.belongsTo(User, {
    foreignKey: 'userId'
});

User.hasOne(Influencer, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Influencer.belongsTo(User, {
    foreignKey: 'userId'
});


Sponsor.hasMany(Campaign, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    },
    sourceKey: 'userId',
    onDelete: 'CASCADE'
});
Campaign.belongsTo(Sponsor, {
    foreignKey: 'userId',
    targetKey: 'userId'  
});

Campaign.hasMany(AdRequest, {
    foreignKey: {
        name: 'campaignId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
AdRequest.belongsTo(Campaign, {
    foreignKey: 'campaignId'
});


Influencer.hasMany(AdRequest, {
    foreignKey: {
        name: 'influencerId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
AdRequest.belongsTo(Influencer, {
    foreignKey: 'influencerId'
});

module.exports = {
    sequelize,
    User,
    Sponsor,
    Influencer,
    Campaign,
    AdRequest
};
