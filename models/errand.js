const mongoose = require('mongoose');

const ErrandSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    pickupAddress: {
      type: String,
      required: true,
    },

    deliveryAddress: {
      type: String,
      required: true,
    },

    pickupContact: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['Open', 'Assigned', 'Completed', 'Cancelled'],
      default: 'Open',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    startOTP: {
      type: String,
    },

    deliveryOTP: {
      type: String,
    },

    startOTPExpires: {
      type: Date,
    },

    deliveryOTPExpires: {
      type: Date,
    },

    attachments: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Timeline timestamps
    orderAssignedAt: { type: Date },
    headingToPickupAt: { type: Date },
    arrivedAtPickupAt: { type: Date },
    itemPickedAt: { type: Date },
    headingToDeliveryAt: { type: Date },
    arrivedAtDeliveryAt: { type: Date },
    deliveredConfirmedAt: { type: Date },
  },

  { timestamps: true }
);

// Optional getter/setter for attachments:
ErrandSchema.path('attachments').get(function (value) {
  return value || null;
});

ErrandSchema.path('attachments').set(function (value) {
  return value;
});

const Errand = mongoose.model('Errand', ErrandSchema);

module.exports = Errand;
