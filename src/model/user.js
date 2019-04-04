const Sequelize = require('sequelize');
const sequelize = require('../config/db/db');

const User = sequelize.define('user', {
  login: Sequelize.STRING,
  password: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  eMail: Sequelize.STRING,
  // ident: Sequelize.INTEGER.UNSIGNED,
});

module.exports = User;
