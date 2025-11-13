const {  DataTypes, Model,  } = require('sequelize');
const sequelize = require('../database/databases')
  class Notification extends Model { }

  Notification.init({
     id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      type: {
        type: DataTypes.STRING, // e.g. 'application_accepted', 'kyc_approved'
        allowNull: false
  },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      meta: {
   allowNull: true,
   type: DataTypes.TEXT,
   get() {
     const rawValue = this.getDataValue('meta');
     return rawValue ? JSON.parse(rawValue) : null;
    },
     set(value) {
    this.setDataValue('meta', JSON.stringify(value));
  }
},
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
  }, {
  sequelize,
  modelName: 'Notifications',
  tableName: 'Notifications',
  timestamps: true
});

module.exports = Notification;