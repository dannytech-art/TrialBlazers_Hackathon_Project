'use strict';

const { sequelize } = require('../models/users');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING, // e.g. 'application_accepted', 'kyc_approved'
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      meta: {
  type: Sequelize.TEXT,
  allowNull: true,
  get() {
    const rawValue = this.getDataValue('meta');
    return rawValue ? JSON.parse(rawValue) : null;
  },
  set(value) {
    this.setDataValue('meta', JSON.stringify(value));
  }
},
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};