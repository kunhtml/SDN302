const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Made optional for flexibility
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false, // Only true if order exists
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sellerResponse: {
      comment: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
