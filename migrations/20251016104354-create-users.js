'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('Client', 'Runner'),
        allowNull: false
      },
      profileImage: {
        type: Sequelize.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('profileImage');
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue('profileImage', JSON.stringify(value));
        }
            },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      kycStatus: {
        type: Sequelize.ENUM('Not completed', 'pending', 'approved', 'rejected', 'verified'),
        allowNull: false,
        defaultValue: 'Not completed',
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      otpExpiredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalJobs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      otpVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
