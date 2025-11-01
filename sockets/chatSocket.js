// sockets/chatSocket.js
const { Op } = require("sequelize");
const Message = require("../models/message");
const jwt = require("jsonwebtoken"); // for verifying tokens

/**
 * Initializes socket.io chat events.
 * Each chat is a private room between sender and receiver.
 */
function initializeChatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Step 1: Authenticate user using token from frontend
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("No token provided — disconnecting socket");
      return socket.disconnect(true);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id; // Save user ID for this socket session
      console.log(`Authenticated user: ${socket.userId}`);
    } catch (error) {
      console.log("Invalid token — disconnecting socket");
      return socket.disconnect(true);
    }

    // Step 2: When a user joins a private room
    socket.on("join_room", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      console.log(`User ${senderId} joined room ${roomId}`);
    });

    // Step 3: When a user sends a message
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, text } = data;

      if (!senderId || !receiverId || !text) {
        console.error("Missing message data");
        return;
      }

      const roomId = [senderId, receiverId].sort().join("_");

      try {
        // Save to DB
        const message = await Message.create({
          senderId,
          receiverId,
          text,
          // If you added roomId in Message model, include it here
          // roomId,
        });

        // Send message only to users in that private room
        io.to(roomId).emit("receive_message", message);

        console.log(`Message sent in room ${roomId}`);
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    // Step 4: When user disconnects
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeChatSocket;
