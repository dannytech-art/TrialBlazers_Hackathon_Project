const mongoose = require("mongoose");

const RefundSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true
    },

    refundReference: {
      type: String,
      required: true,
      unique: true
    },

    amount: {
      type: Number,
      required: true
    },

    reason: {
      type: String,
      default: null
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: ["processing", "success", "failed"],
      default: "processing"
    },

    refundResponse: {
      type: Object,
      default: null // works like JSON in Sequelize
    }
  },
  {
    timestamps: true // Keep createdAt & updatedAt automatically
  }
);

// Unique index for refundReference
RefundSchema.index({ refundReference: 1 }, { unique: true });

const Refund = mongoose.model("Refund", RefundSchema);

module.exports = Refund
