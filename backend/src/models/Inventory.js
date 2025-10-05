const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    reorderQuantity: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated on save
inventorySchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for low stock warning
inventorySchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// Index
inventorySchema.index({ productId: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
