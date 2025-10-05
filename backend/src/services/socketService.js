const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const socketService = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    logger.info(`New socket connection: ${socket.id}`);

    // Authenticate socket connection
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        connectedUsers.set(decoded.id, socket.id);
        logger.info(`User authenticated: ${decoded.id}`);
        socket.emit("authenticated", { success: true });
      } catch (error) {
        logger.error(`Socket authentication failed: ${error.message}`);
        socket.emit("authenticated", {
          success: false,
          message: "Authentication failed",
        });
      }
    });

    // Join conversation room
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      logger.info(
        `User ${socket.userId} joined conversation ${conversationId}`
      );
    });

    // Leave conversation room
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on("send-message", async (data) => {
      try {
        const { conversationId, content, receiverId } = data;

        // Emit to conversation room
        io.to(`conversation-${conversationId}`).emit("new-message", {
          conversationId,
          content,
          senderId: socket.userId,
          timestamp: new Date(),
        });

        // Send notification to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message-notification", {
            conversationId,
            senderId: socket.userId,
          });
        }

        logger.info(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        logger.error(`Send message error: ${error.message}`);
        socket.emit("message-error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    // Stop typing indicator
    socket.on("stop-typing", (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-stop-typing", {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    // Mark message as read
    socket.on("mark-read", (data) => {
      const { conversationId, senderId } = data;
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message-read", {
          conversationId,
          readBy: socket.userId,
        });
      }
    });

    // Send notification
    socket.on("send-notification", (data) => {
      const { userId, notification } = data;
      const userSocketId = connectedUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit("notification", notification);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        logger.info(`User ${socket.userId} disconnected`);
      }
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = socketService;
