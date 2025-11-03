'use strict';
const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create RunnerBankDetails table
    await queryInterface.createTable('RunnerBankDetails', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      runnerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bankCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      verificationDate: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Add indexes
    await queryInterface.addIndex('RunnerBankDetails', ['runnerId']);
    await queryInterface.addIndex('RunnerBankDetails', ['bankCode']);
    await queryInterface.addIndex('RunnerBankDetails', ['isVerified']);
    await queryInterface.addIndex('RunnerBankDetails', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RunnerBankDetails');
  },
};
