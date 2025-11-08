const { Message, Conversation } = require("../models/Chat");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get all conversations for current user
// @route   GET /api/v1/chat/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate("participants", "username email avatarURL role")
    .populate("relatedProduct", "title images price")
    .sort({ lastMessageAt: -1 })
    .lean();

  // Get unread count for each conversation
  // Note: .lean() converts Map to plain object, so access directly
  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv,
    unreadCount: conv.unreadCount?.[req.user._id.toString()] || 0,
  }));

  res.json({
    success: true,
    data: conversationsWithUnread,
  });
});

// @desc    Get or create conversation between two users
// @route   POST /api/v1/chat/conversations
// @access  Private
exports.createOrGetConversation = asyncHandler(async (req, res) => {
  const { participantId, productId } = req.body;

  if (!participantId) {
    return res.status(400).json({
      success: false,
      message: "Participant ID is required",
    });
  }

  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Don't allow chat with yourself
  if (participantId === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "Cannot create conversation with yourself",
    });
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId] },
    isActive: true,
  })
    .populate("participants", "username email avatarURL role")
    .populate("relatedProduct", "title images price");

  if (conversation) {
    return res.json({
      success: true,
      data: conversation,
    });
  }

  // Create new conversation
  conversation = await Conversation.create({
    participants: [req.user._id, participantId],
    relatedProduct: productId || null,
    unreadCount: {
      [req.user._id.toString()]: 0,
      [participantId]: 0,
    },
  });

  // Populate fields
  conversation = await Conversation.findById(conversation._id)
    .populate("participants", "username email avatarURL role")
    .populate("relatedProduct", "title images price");

  // Emit socket event to notify participant
  const io = req.app.get("io");
  io.to(participantId).emit("new-conversation", conversation);

  res.status(201).json({
    success: true,
    data: conversation,
  });
});

// @desc    Get messages in a conversation
// @route   GET /api/v1/chat/conversations/:id/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify user is part of conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username avatarURL")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Message.countDocuments({ conversation: conversationId });

  res.json({
    success: true,
    data: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

// @desc    Send a message
// @route   POST /api/v1/chat/conversations/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { content, messageType = "text", attachment } = req.body;

  if (!content && !attachment) {
    return res.status(400).json({
      success: false,
      message: "Message content or attachment is required",
    });
  }

  // Verify user is part of conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    messageType,
    attachment,
  });

  // Populate sender info
  await message.populate("sender", "username avatarURL");

  // Update conversation
  const receiverId = conversation.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();

  // Increment unread count for receiver
  const currentUnread =
    conversation.unreadCount.get(receiverId.toString()) || 0;
  conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);

  await conversation.save();

  // Emit socket event
  const io = req.app.get("io");
  io.to(`conversation-${conversationId}`).emit("new-message", message);
  io.to(receiverId.toString()).emit("message-notification", {
    conversationId,
    message,
  });

  res.status(201).json({
    success: true,
    data: message,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/v1/chat/conversations/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;

  // Verify user is part of conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Mark all unread messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  // Reset unread count
  conversation.unreadCount.set(req.user._id.toString(), 0);
  await conversation.save();

  // Emit socket event
  const io = req.app.get("io");
  const senderId = conversation.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );
  io.to(senderId.toString()).emit("messages-read", {
    conversationId,
    readBy: req.user._id,
  });

  res.json({
    success: true,
    message: "Messages marked as read",
  });
});

// @desc    Delete conversation
// @route   DELETE /api/v1/chat/conversations/:id
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Soft delete - just mark as inactive
  conversation.isActive = false;
  await conversation.save();

  res.json({
    success: true,
    message: "Conversation deleted",
  });
});
