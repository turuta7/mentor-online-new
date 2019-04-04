const Sequelize = require('sequelize');

module.exports = new Sequelize(
  'heroku_899ec976691cadc',
  'b612fbf99b5618',
  'b5b6ce6a',
  {
    dialect: 'mysql',
    host: 'us-cdbr-iron-east-03.cleardb.net',
    port: '3306',

    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
);
