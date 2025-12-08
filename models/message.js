const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // automatically creates createdAt & updatedAt
  }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
