const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true
    },

    description: {
      type: String,
      default: null
    },

    reference: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed"
    },

    balanceBefore: {
      type: mongoose.Schema.Types.Decimal128,
      default: null
    },

    balanceAfter: {
      type: mongoose.Schema.Types.Decimal128,
      default: null
    },

    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true // createdAt & updatedAt
  }
);

// Indexes equivalent to Sequelize
WalletTransactionSchema.index({ walletId: 1 });
WalletTransactionSchema.index({ reference: 1 });
WalletTransactionSchema.index({ type: 1 });
WalletTransactionSchema.index({ status: 1 });

const WalletTransaction = mongoose.model("WalletTransaction", WalletTransactionSchema);

module.exports = WalletTransaction
