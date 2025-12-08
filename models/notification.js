const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String, 
      required: true, 
      // examples: 'application_accepted', 'kyc_approved', 'errand_rejected'
    },

    message: {
      type: String,
      required: true,
    },

    meta: {
      type: Object,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
