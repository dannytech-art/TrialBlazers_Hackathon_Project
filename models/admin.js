'use strict';

const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../database/databases');

class Admin extends Model {}

Admin.init(
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
      set(value) {
        // Ensure lowercase and trimmed email before savingrs
        this.setDataValue('email', value.trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,            // Sequelize instance
    modelName: 'Admins',   // Model name
    timestamps: true,     // Automatically add createdAt/updatedAt
  }
);

module.exports = Admin;