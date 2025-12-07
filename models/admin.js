const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true,     // Automatically add createdAt/updatedAt
  }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;