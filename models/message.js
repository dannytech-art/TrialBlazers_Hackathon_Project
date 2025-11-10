const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/databases')

class Message extends Model {}

Message.init(
  {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      senderId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      receiverId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      roomId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false
      },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Messages', // We need to choose the model name
    timestamps: true
  },
);

module.exports = Message;