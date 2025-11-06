'use strict';
const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WalletTransactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      walletId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('credit', 'debit'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'completed',
      },
      balanceBefore: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      balanceAfter: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.TEXT, // use TEXT instead of JSON for MySQL < 5.7
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex('WalletTransactions', ['walletId']);
    await queryInterface.addIndex('WalletTransactions', ['reference']);
    await queryInterface.addIndex('WalletTransactions', ['type']);
    await queryInterface.addIndex('WalletTransactions', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WalletTransactions');
  },
};
