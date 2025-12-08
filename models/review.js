const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    errandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Errand",
      required: true,
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt automatically
  }
);

// Ensure "id" behaves as a primary key alternative
ReviewSchema.index({ id: 1 }, { unique: true });

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review
