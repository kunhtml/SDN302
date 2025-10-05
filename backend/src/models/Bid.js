const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [0, "Bid amount cannot be negative"],
    },
    bidTime: {
      type: Date,
      default: Date.now,
    },
    isWinning: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "outbid", "won", "lost", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for product and bid time
bidSchema.index({ productId: 1, bidTime: -1 });
bidSchema.index({ bidderId: 1, bidTime: -1 });
bidSchema.index({ productId: 1, amount: -1 });

// Method to check if bid is valid (higher than current highest)
bidSchema.statics.isValidBid = async function (productId, amount) {
  const highestBid = await this.findOne({ productId })
    .sort({ amount: -1 })
    .limit(1);

  return !highestBid || amount > highestBid.amount;
};

// Method to get highest bid for a product
bidSchema.statics.getHighestBid = async function (productId) {
  return await this.findOne({ productId })
    .sort({ amount: -1 })
    .limit(1)
    .populate("bidderId", "username email");
};

// Update previous bids status when new bid is placed
bidSchema.post("save", async function () {
  if (this.status === "active") {
    await this.constructor.updateMany(
      {
        productId: this.productId,
        _id: { $ne: this._id },
        amount: { $lt: this.amount },
        status: "active",
      },
      { status: "outbid", isWinning: false }
    );

    // Set this as winning bid
    this.isWinning = true;
    await this.save();
  }
});

module.exports = mongoose.model("Bid", bidSchema);
