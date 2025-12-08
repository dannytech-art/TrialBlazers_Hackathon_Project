const mongoose = require("mongoose");

const RunnerBankDetailsSchema = new mongoose.Schema(
  {
    runnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",    // References User collection
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Auto-handles createdAt & updatedAt
  }
);

// 🔍 Indexes (equivalent to Sequelize indexes)
RunnerBankDetailsSchema.index({ runnerId: 1 });
RunnerBankDetailsSchema.index({ bankCode: 1 });
RunnerBankDetailsSchema.index({ isVerified: 1 });
RunnerBankDetailsSchema.index({ isActive: 1 });

const RunnerBankDetails = mongoose.model("RunnerBankDetails", RunnerBankDetailsSchema); 

module.exports = RunnerBankDetails
