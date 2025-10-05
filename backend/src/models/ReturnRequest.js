const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Return reason is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "pending",
      maxlength: [20, "Status cannot exceed 20 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    adminResponse: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundMethod: {
      type: String,
      enum: ["original_payment", "store_credit", "bank_transfer"],
    },
    returnShippingInfo: {
      carrier: String,
      trackingNumber: String,
      status: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
returnRequestSchema.index({ orderId: 1 });
returnRequestSchema.index({ userId: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
