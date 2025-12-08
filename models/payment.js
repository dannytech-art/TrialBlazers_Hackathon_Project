const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    errandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      default: null,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true
    },

    transactionId: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
    },
  },
  { timestamps: true }
);
const Payment =  mongoose.model("Payment", PaymentSchema);

module.exports = Payment
