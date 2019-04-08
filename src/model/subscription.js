const Sequelize = require('sequelize');
const sequelize = require('../config/db/db');

const Subscription = sequelize.define('subscription', {
  idName: Sequelize.INTEGER,
  idCous: Sequelize.INTEGER,
  idTeach: Sequelize.INTEGER,
  nameTeacher: Sequelize.STRING,
});

module.exports = Subscription;
