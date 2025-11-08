const Feedback = require("../models/Feedback");
const User = require("../models/User");
const logger = require("../config/logger");

// @desc    Get seller feedback by seller ID
// @route   GET /api/v1/feedback/seller/:sellerId
// @access  Public
exports.getSellerFeedback = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Get feedback
    let feedback = await Feedback.findOne({ sellerId });

    // If no feedback exists, return default values
    if (!feedback) {
      feedback = {
        sellerId,
        averageRating: 0,
        totalReviews: 0,
        positiveRate: 0,
        ratingDistribution: {
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        },
        totalSales: 0,
        responseRate: 0,
        responseTime: 0,
        onTimeDeliveryRate: 0,
      };
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error(`Error getting seller feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching seller feedback",
      error: error.message,
    });
  }
};

// @desc    Get my feedback (for sellers)
// @route   GET /api/v1/feedback/my-feedback
// @access  Private (Seller)
exports.getMyFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findOne({ sellerId: req.user._id });

    if (!feedback) {
      feedback = {
        sellerId: req.user._id,
        averageRating: 0,
        totalReviews: 0,
        positiveRate: 0,
        ratingDistribution: {
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        },
        totalSales: 0,
        responseRate: 0,
        responseTime: 0,
        onTimeDeliveryRate: 0,
      };
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error(`Error getting my feedback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      error: error.message,
    });
  }
};
