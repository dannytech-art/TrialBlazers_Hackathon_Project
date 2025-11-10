const Message = require("../models/message");
const { Sequelize } = require("sequelize");
const User = require("../models/users");

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);
    const otherUserId = String(req.params.userId);

    const roomId = [currentUserId, otherUserId].sort().join("_");

    const messages = await Message.findAll({
      where: { roomId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "profileImage",
            "rating",
            "role",
          ],
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "profileImage",
            "rating",
            "role",
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message: `Found ${messages.length} messages between users`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({
      message: "Failed to get messages",
      error: err.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !text) {
    return res
      .status(400)
      .json({ error: "Missing receiverId or text" });
  }

  try {
    const roomId = [senderId, receiverId].sort().join("_");

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      roomId,
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "profileImage",
            "rating",
            "role",
          ],
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "profileImage",
            "rating",
            "role",
          ],
        },
      ],
    });

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
