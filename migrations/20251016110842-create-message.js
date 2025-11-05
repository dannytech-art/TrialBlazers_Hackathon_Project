'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      senderId: {
        type: Sequelize.UUID, // use UUID for foreign keys
        allowNull: false
      },
      receiverId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT('long'), // supports large messages
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
    }, {
      engine: 'InnoDB'
    });

    // Only index UUID columns for lookup
    await queryInterface.addIndex('Messages', ['senderId']);
    await queryInterface.addIndex('Messages', ['receiverId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};
