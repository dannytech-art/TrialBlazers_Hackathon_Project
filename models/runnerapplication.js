const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/databases');
const User = require('./users');
const Errand = require('./errand');

class RunnerApplication extends Model {}

RunnerApplication.init(
  {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    runnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // References Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    errandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Errands', // References Errands table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    bidPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'runnerapplication',
    tableName: 'runnerapplications',
    timestamps: true,
  }
);


module.exports = RunnerApplication;
