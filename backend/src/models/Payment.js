const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: [
        "paypal",
        "stripe",
        "cod",
        "bank_transfer",
        "credit_card",
        "debit_card",
      ],
      maxlength: [50, "Method cannot exceed 50 characters"],
    },
    status: {
      type: String,
      required: [true, "Payment status is required"],
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
      maxlength: [20, "Status cannot exceed 20 characters"],
    },
    paidAt: {
      type: Date,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentGatewayResponse: {
      type: Object,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

// Update paidAt when status changes to completed
paymentSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "completed" &&
    !this.paidAt
  ) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
