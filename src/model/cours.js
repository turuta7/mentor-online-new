const Sequelize = require('sequelize');
const sequelize = require('../config/db/db');

const Cours = sequelize.define('cours', {
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  category: Sequelize.STRING,
  idUser: Sequelize.INTEGER,
});

module.exports = Cours;
