'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('runnerapplications', 'userId', {
      type: Sequelize.UUID,
      allowNull: true, // set true if some records don't have a user yet
      references: {
        model: 'Users', // make sure this matches your users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('runnerapplications', 'userId');
  },
};
