const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Vietnam",
    },
    zipCode: {
      type: String,
      trim: true,
    },
    bannerImageURL: {
      type: String,
      default: "https://via.placeholder.com/1200x300",
    },
    logo: {
      type: String,
      default: "https://via.placeholder.com/200x200",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    businessInfo: {
      businessName: String,
      taxId: String,
      businessAddress: String,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
storeSchema.index({ storeName: "text", description: "text" });

module.exports = mongoose.model("Store", storeSchema);
