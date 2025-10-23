const { Sequelize, DataTypes, Model, BOOLEAN } = require('sequelize');
const sequelize = require('../database/databases');
const ErrandAssignment = require('./errandassignment');
const Errand = require('./errand');
const Review = require('./review');

class User extends Model {}

User.init(
  {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        lowerCase: true,
        trim: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role:{
        type: DataTypes.ENUM(['Client', 'Runner']),
        allowNull: false
      },
      profileImage: {
        type: DataTypes.STRING
      },
      otp:{
        type: DataTypes.STRING
      },
      otpExpiredAt: {
        type: DataTypes.DATE
     },
      isVerified:{
        type: DataTypes.BOOLEAN,
        default: false
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      totalJobs: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      token: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      wallet:{
        type:DataTypes.NUMBER,
        defaultValue:0
      }
  },
  {
    sequelize, 
    modelName: 'Users', 
    timestamps: true
  },
);

User.hasMany(Errand, {foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.hasMany(ErrandAssignment, {foreignKey: 'runnerId'});
User.hasMany(Review, {foreignKey: 'reviewerId'});


module.exports = User;