const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    attachment: {
      url: String,
      filename: String,
      fileSize: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique conversations between two users
conversationSchema.index({ participants: 1 });

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Message, Conversation };
