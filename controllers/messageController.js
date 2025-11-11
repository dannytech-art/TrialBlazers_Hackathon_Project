const Message = require("../models/message");
const { Sequelize } = require("sequelize");
const User = require("../models/users");
const Errand = require("../models/errand");
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
      message: `Found ${messages.length} messages for this errand`,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ message: "Failed to get messages", error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { text } = req.body;
  const { errandId } = req.params;
  const senderId = req.user.id; // from authenticated token

  if (!errandId || !text) {
    return res.status(400).json({ error: "Missing errandId or text" });
  }

  try {
    const errand = await Errand.findByPk(errandId);

    if (!errand) {
      return res.status(404).json({ error: "Errand not found" });
    }

    // determine receiver based on who initiated
    const receiverId =
      errand.assignedTo === senderId ? errand.userId : errand.assignedTo;

    if (!receiverId) {
      return res.status(400).json({ error: "Errand has no assigned user yet" });
    }

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
