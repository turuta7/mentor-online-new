const Sequelize = require('sequelize');
const sequelize = require('../config/db/db');

const Cours = sequelize.define('cours', {
  name: Sequelize.STRING,
  imgUrl: Sequelize.STRING,
  teacher: Sequelize.STRING,
  ratingStar: Sequelize.INTEGER,
  ratingVotes: Sequelize.INTEGER,
  price: Sequelize.INTEGER,
  priceDiscount: Sequelize.INTEGER,
  description: Sequelize.STRING,

  type: Sequelize.STRING,
  category: Sequelize.STRING,
  idUser: Sequelize.INTEGER,
});

module.exports = Cours;
