const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'archiesql', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
