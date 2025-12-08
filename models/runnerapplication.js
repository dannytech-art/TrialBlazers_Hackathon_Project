const mongoose = require('mongoose');

const RunnerApplicationSchema = new mongoose.Schema(
  {
    runnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    errandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Errand',
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },

    bidPrice: {
      type: Number,
      default: null,
    },

    currentPrice: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);



const RunnerApplication = mongoose.model('RunnerApplication', RunnerApplicationSchema);

module.exports = RunnerApplication;
