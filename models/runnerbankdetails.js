const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/databases');

class RunnerBankDetails extends Model {}

RunnerBankDetails.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    runnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Bank code',
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Bank name (e.g., "First Bank of Nigeria")'
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Bank account number'
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Account holder name'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the bank account is verified'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this bank account is active for withdrawals'
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when account was verified'
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
    modelName: 'RunnerBankDetails',
    timestamps: true,
    indexes: [
      {
        fields: ['runnerId']
      },
      {
        fields: ['bankCode']
      },
      {
        fields: ['isVerified']
      },
      {
        fields: ['isActive']
      }
    ]
  }
);

module.exports = RunnerBankDetails;
