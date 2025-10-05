const mongoose = require("mongoose");

const shippingInfoSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    carrier: {
      type: String,
      maxlength: [100, "Carrier name cannot exceed 100 characters"],
    },
    trackingNumber: {
      type: String,
      maxlength: [100, "Tracking number cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned",
      ],
      default: "pending",
      maxlength: [50, "Status cannot exceed 50 characters"],
    },
    estimatedArrival: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: String,
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index
shippingInfoSchema.index({ orderId: 1 });
shippingInfoSchema.index({ trackingNumber: 1 });
shippingInfoSchema.index({ status: 1 });

// Update actual delivery date when status is delivered
shippingInfoSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "delivered" &&
    !this.actualDeliveryDate
  ) {
    this.actualDeliveryDate = new Date();
  }
  next();
});

module.exports = mongoose.model("ShippingInfo", shippingInfoSchema);
