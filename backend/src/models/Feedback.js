const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
    positiveRate: {
      type: Number,
      default: 0,
      min: [0, "Positive rate cannot be negative"],
      max: [100, "Positive rate cannot exceed 100"],
    },
    ratingDistribution: {
      fiveStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 },
    },
    // Detailed metrics
    totalSales: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: Number,
      default: 0,
      min: [0, "Response rate cannot be negative"],
      max: [100, "Response rate cannot exceed 100"],
    },
    responseTime: {
      type: Number, // in hours
      default: 0,
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: [0, "On-time delivery rate cannot be negative"],
      max: [100, "On-time delivery rate cannot exceed 100"],
    },
  },
  {
    timestamps: true,
  }
);

// Method to update feedback statistics
feedbackSchema.methods.updateStats = async function (newRating) {
  const totalReviews = this.totalReviews + 1;
  const totalRating = this.averageRating * this.totalReviews + newRating;
  this.averageRating = totalRating / totalReviews;
  this.totalReviews = totalReviews;

  // Update rating distribution
  const ratingKey = `${
    ["oneStar", "twoStar", "threeStar", "fourStar", "fiveStar"][newRating - 1]
  }`;
  this.ratingDistribution[ratingKey] += 1;

  // Calculate positive rate (4 and 5 stars)
  const positiveReviews =
    this.ratingDistribution.fiveStar + this.ratingDistribution.fourStar;
  this.positiveRate = (positiveReviews / totalReviews) * 100;

  await this.save();
};

// Index
feedbackSchema.index({ sellerId: 1 });
feedbackSchema.index({ averageRating: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
