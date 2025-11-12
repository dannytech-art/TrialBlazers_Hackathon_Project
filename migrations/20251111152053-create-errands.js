'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Errands', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      pickupAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      deliveryAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      pickupContact: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Open', 'Assigned', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Open',
      },
     
      assignedTo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      startOTP: {
        type: Sequelize.STRING,
      },
      deliveryOTP: {
        type: Sequelize.STRING,
      },
      startOTPExpires: {
        type: Sequelize.STRING,
      },
      deliveryOTPExpires: {
        type: Sequelize.STRING,
      },
      attachments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      orderAssignedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      headingToPickupAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      arrivedAtPickupAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      itemPickedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      headingToDeliveryAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      arrivedAtDeliveryAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveredConfirmedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // Default Sequelize timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop ENUM before dropping table to avoid errors in PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Errands_status";');
    await queryInterface.dropTable('Errands');
  },
};
