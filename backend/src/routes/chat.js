const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
} = require("../controllers/chatController");

// All routes require authentication
router.use(protect);

// Conversation routes
router.get("/conversations", getConversations);
router.post("/conversations", createOrGetConversation);
router.delete("/conversations/:id", deleteConversation);

// Message routes
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);
router.put("/conversations/:id/read", markAsRead);

module.exports = router;
