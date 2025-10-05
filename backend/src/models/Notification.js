const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "shipping",
        "review",
        "promotion",
        "message",
        "dispute",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
