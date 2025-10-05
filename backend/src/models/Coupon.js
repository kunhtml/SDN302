const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, "Coupon code cannot exceed 50 characters"],
    },
    description: {
      type: String,
    },
    discountPercent: {
      type: Number,
      min: [0, "Discount percent cannot be negative"],
      max: [100, "Discount percent cannot exceed 100"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    maxUsage: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

module.exports = mongoose.model("Coupon", couponSchema);
