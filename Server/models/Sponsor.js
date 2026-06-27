const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Sponsor = sequelize.define('Sponsor', {
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.INTEGER
  }
});

Sponsor.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Sponsor, { foreignKey: 'userId' });

module.exports = Sponsor;
