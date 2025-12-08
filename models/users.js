const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['Client', 'Runner'],
      required: true,
    },

    bio: {
      type: String,
      default: null,
    },

    kycStatus: {
      type: String,
      enum: ['Not completed', 'Pending', 'Approved', 'Rejected', 'Verified'],
      default: 'Not completed',
    },

    otp: {
      type: String,
    },

    otpExpiredAt: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalJobs: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    token: {
      type: String,
      default: '',
    },

    profileImage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },

  { timestamps: true }
);

// If you want getter/setter behavior similar to sequelize:
UserSchema.path('profileImage').get(function (value) {
  return value ? value : null;
});

UserSchema.path('profileImage').set(function (value) {
  return value;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
