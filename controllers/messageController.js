const { Sequelize } = require("sequelize");
const { Errand, Message, User } = require('../models'); //


exports.initializeIO = (io) => {
  ioInstance = io;
  console.log("Socket.io instance initialized");
};
exports.getMessages = async (req, res) => {
  const { errandId } = req.params;

  try {
    const errand = await Errand.findByPk(errandId);
    if (!errand) return res.status(404).json({ message: "Errand not found" });

    const senderId = req.user.id;
    const receiverId = errand.assignedTo === senderId ? errand.userId : errand.assignedTo;

    if (!receiverId) return res.status(400).json({ message: "Errand has no assigned user yet" });

    const roomId = [senderId, receiverId].sort().join("_");

    const messages = await Message.findAll({
      where: { roomId },
      include: [
        { model: User, as: "sender", attributes: ["id", "firstName", "lastName", "profileImage", "role"] },
        { model: User, as: "receiver", attributes: ["id", "firstName", "lastName", "profileImage", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message:` Found ${messages.length} messages for this errand`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ message: "Failed to get messages", error: err.message });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    const { text, senderId, receiverId, roomId } = req.body;
    const { errandId } = req.params;

    if (!errandId || !text || !senderId || !receiverId || !roomId) {
      return res.status(400).json({
        error: "Missing text, senderId, receiverId, errandId or roomId",
      });
    }

    // Save message
    const message = await Message.create({
      senderId,
      receiverId,
      text,
      roomId,
    });

    // Fetch full message with relations
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profileImage", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "profileImage", "role"],
        },
      ],
    });

    // REAL-TIME EMIT
    if (ioInstance) {
      ioInstance.to(roomId).emit("receive_message", fullMessage);
      console.log( `Emitted message to room: ${roomId}`);
    } else {
      console.log("Socket.io not initialized");
    }

    // API Response
    res.status(201).json({
      message: "Message sent successfully",
      data: fullMessage,
    });

  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
};

exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.findAll({
      where: { roomId },
      include: [
        { model: User, as: "sender", attributes: ["id", "firstName", "lastName", "profileImage", "role"] },
        { model: User, as: "receiver", attributes: ["id", "firstName", "lastName", "profileImage", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      message: `Found ${messages.length} messages`,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message});
  }
};

