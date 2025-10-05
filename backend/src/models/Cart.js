const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total items before saving
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
