const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('influencer_db', 'root', 'Saksham2006', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '+05:30',
});

module.exports = sequelize;
