const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    governmentIdCard: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    proofOfAddressImage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    selfieWithIdCard: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'verified'],
      default: 'pending',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', 
      default: null, 
    },
  },
  { timestamps: true }
);

// Optional getters/setters (preserves your Sequelize JSON behavior)
KYCSchema.path('governmentIdCard').get(function (value) {
  return value || null;
});

KYCSchema.path('proofOfAddressImage').get(function (value) {
  return value || null;
});

KYCSchema.path('selfieWithIdCard').get(function (value) {
  return value || null;
});

const KYC = mongoose.model('KYC', KYCSchema);

module.exports = KYC;
