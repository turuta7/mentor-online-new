const Sequelize = require('sequelize');
const sequelize = require('../config/db/db');

const Url = sequelize.define('url', {
  url: Sequelize.STRING,
  idCourse: Sequelize.INTEGER,
});

module.exports = Url;
