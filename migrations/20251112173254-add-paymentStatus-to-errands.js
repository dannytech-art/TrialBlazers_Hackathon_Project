'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Errands', 'paymentStatus', {
      type: Sequelize.ENUM('pending', 'paid', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Errands', 'paymentStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Errands_paymentStatus";');
  }
};
