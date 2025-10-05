const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    reason: {
      type: String,
      enum: [
        "not-received",
        "damaged",
        "wrong-item",
        "not-as-described",
        "counterfeit",
        "quality-issue",
        "other",
      ],
    },
    status: {
      type: String,
      enum: ["open", "under-review", "resolved", "rejected", "closed"],
      default: "open",
      maxlength: [20, "Status cannot exceed 20 characters"],
    },
    resolution: {
      type: String,
      enum: [
        "refund-full",
        "refund-partial",
        "replacement",
        "rejected",
        "none",
      ],
    },
    resolutionNote: {
      type: String,
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ["image", "document"],
        },
        url: String,
        public_id: String,
        description: String,
      },
    ],
    refundAmount: {
      type: Number,
      default: 0,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    buyerResponse: {
      comment: String,
      satisfied: Boolean,
      respondedAt: Date,
    },
    sellerResponse: {
      comment: String,
      respondedAt: Date,
    },
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for queries
disputeSchema.index({ order: 1 });
disputeSchema.index({ buyer: 1, status: 1 });
disputeSchema.index({ seller: 1, status: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Dispute", disputeSchema);
