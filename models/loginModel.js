'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Login extends Model {
    
    static associate(models) {}
  }

  Login.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Login',
      tableName: 'logins',
      timestamps: true,
    }
  );

  return Login;
};
