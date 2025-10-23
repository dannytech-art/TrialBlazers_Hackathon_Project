const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('hackathon', 'root', '#Joseph54321', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize