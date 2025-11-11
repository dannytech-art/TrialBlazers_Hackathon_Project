const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/databases');

class Refund extends Model {}

Refund.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Payments', key: 'id' }, // relation to Payment table
    },
    refundReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verifiedBy: {
  type: DataTypes.UUID,
  allowNull: true,
  references: { model: 'Users', key: 'id' },
},
    status: {
      type: DataTypes.ENUM('processing', 'success', 'failed'),
      defaultValue: 'processing',
    },
    refundResponse: {
      type: DataTypes.JSON, // stores API response details (optional)
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Refunds',
    timestamps: true,
  }
);

module.exports = Refund;
