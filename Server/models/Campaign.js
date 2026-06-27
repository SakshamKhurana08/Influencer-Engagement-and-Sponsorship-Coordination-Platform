const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sponsor = require('./Sponsor');

const Campaign = sequelize.define('Campaign', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.INTEGER
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

Campaign.belongsTo(Sponsor, {
  foreignKey: 'userId',
  targetKey: 'userId', // 👈 this is necessary!
  onDelete: 'CASCADE',
  as: 'sponsor'
});

Sponsor.hasMany(Campaign, {
  foreignKey: 'userId',
  sourceKey: 'userId' // 👈 this too!
});

module.exports = Campaign;
