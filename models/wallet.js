const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    runnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each runner has only one wallet
    },

    balance: {
      type: mongoose.Schema.Types.Decimal128, 
      default: 0.00,
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    lastTransactionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt & updatedAt
  }
);

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet
