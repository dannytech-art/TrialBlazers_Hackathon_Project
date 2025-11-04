'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KYCs', {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: UUIDV4,
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
            type: Sequelize.TEXT,
            allowNull: true,
            get() {
              const rawValue = this.getDataValue('governmentIdCard');
              return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
              this.setDataValue('governmentIdCard', JSON.stringify(value));
            },
          },

          proofOfAddressImage: {
            type: Sequelize.TEXT,
            allowNull: true,
            get() {
              const rawValue = this.getDataValue('proofOfAddressImage');
              return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
              this.setDataValue('proofOfAddressImage', JSON.stringify(value));
            },
          },

          selfieWithIdCard: {
            type: Sequelize.TEXT,
            allowNull: true,
            get() {
              const rawValue = this.getDataValue('selfieWithIdCard');
              return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
              this.setDataValue('selfieWithIdCard', JSON.stringify(value));
            },
          },
    
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected', 'verified'),
            allowNull: false,
            defaultValue: 'pending',
          },
    
          reviewedBy: {
            type: Sequelize.UUID,
            allowNull: true, // could reference an admin or system user
            references: {
        model: 'Users',
        key: 'id',
        },
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
    await queryInterface.dropTable('KYCs');
  }
};