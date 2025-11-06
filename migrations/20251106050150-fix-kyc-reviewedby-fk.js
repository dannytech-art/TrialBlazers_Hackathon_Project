'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the old foreign key to Users
    await queryInterface.removeConstraint('KYCs', 'KYCs_ibfk_2');

    // Add the correct foreign key to Admins
    await queryInterface.addConstraint('KYCs', {
      fields: ['reviewedBy'],
      type: 'foreign key',
      name: 'KYCs_reviewedBy_Admins_fk',
      references: {
        table: 'Admins',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to Users if needed
    await queryInterface.removeConstraint('KYCs', 'KYCs_reviewedBy_Admins_fk');
    await queryInterface.addConstraint('KYCs', {
      fields: ['reviewedBy'],
      type: 'foreign key',
      name: 'KYCs_ibfk_2',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
