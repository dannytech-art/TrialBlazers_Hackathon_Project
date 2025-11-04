'use strict';

const { UUIDV4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KYCs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      governmentIdCard: {
        type: Sequelize.TEXT, // this stores your JSON string or file URL
        allowNull: true,
      },
      proofOfAddressImage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      selfieWithIdCard: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'verified'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      createdAt: {
  allowNull: false,
  type: Sequelize.DATE,
},
updatedAt: {
  allowNull: false,
  type: Sequelize.DATE,
}
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('KYCs');
  },
};
