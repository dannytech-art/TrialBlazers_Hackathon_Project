const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/databases');


class Payment extends Model {}

Payment.init(
  {
     id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      errandId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Errands', key: 'id' }
},

      payerId: {
        type: DataTypes.UUID,
        references: {model: 'Users', key: 'id'}
      },
      receiverId: {
        type: DataTypes.UUID,
        references: {model: 'Users', key: 'id'}
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
       description: {
       type: DataTypes.TEXT
      },
      transactionId: {
        type: DataTypes.STRING
      },
      paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
        defaultValue: 'Pending'
      },
      paymentMethod: {
         type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  },
  {
    sequelize, 
    modelName: 'Payments', 
    timestamps: true
  },






);

module.exports = Payment;