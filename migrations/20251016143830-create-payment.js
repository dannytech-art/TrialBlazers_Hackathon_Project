'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      payerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      receiverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      errandId: {
  type: Sequelize.UUID,
  allowNull: true,
  references: { model: 'Errands', key: 'id' },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
},
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.ENUM('Pending', 'Paid', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
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

    // Optional indexes for better lookup performance
    await queryInterface.addIndex('Payments', ['payerId']);
    await queryInterface.addIndex('Payments', ['receiverId']);
    await queryInterface.addIndex('Payments', ['transactionId']);
    await queryInterface.addIndex('Payments', ['paymentStatus']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};
