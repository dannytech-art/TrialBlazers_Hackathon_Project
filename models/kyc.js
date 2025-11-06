const { Sequelize, DataTypes, Model, UUIDV4 } = require('sequelize');
const sequelize = require('../database/databases');

class KYC extends Model {}

KYC.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE', // ensures KYC is deleted if user is removed
      onUpdate: 'CASCADE',
    },
    governmentIdCard: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('governmentIdCard');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('governmentIdCard', JSON.stringify(value));
      },
    },
    proofOfAddressImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('proofOfAddressImage');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('proofOfAddressImage', JSON.stringify(value));
      },
    },
    selfieWithIdCard: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('selfieWithIdCard');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('selfieWithIdCard', JSON.stringify(value));
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'verified'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true, // could reference an admin or system user
      references: {
        model: 'Admins',
        key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
},
  {
    sequelize,
    modelName: 'KYCs',
    timestamps: true,
  }
);

module.exports = KYC;
