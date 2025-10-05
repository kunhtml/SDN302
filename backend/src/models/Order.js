const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address", // References the address subdocument in User
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    items: [orderItemSchema],
    // Payment info
    paymentMethod: {
      type: String,
      enum: ["paypal", "stripe", "cod", "bank_transfer"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentInfo: {
      id: String,
      paidAt: Date,
    },
    // Shipping info
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    trackingNumber: String,
    carrier: String,
    estimatedArrival: Date,
    // Pricing breakdown
    itemsPrice: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    // Timestamps
    deliveredAt: Date,
    cancelledAt: Date,
    refundedAt: Date,
    notes: String,
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
