const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const logger = require("../config/logger");

// @desc    Get all reviews for a product
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const reviews = await Review.find({ product: productId })
      .populate("user", "username avatarURL")
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Review.countDocuments({ product: productId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`Error getting product reviews: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// @desc    Get all reviews for seller's products
// @route   GET /api/v1/reviews/seller
// @access  Private (Seller)
exports.getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 10, rating, hasResponse, search } = req.query;

    // Get all seller's products
    const sellerProducts = await Product.find({ sellerId }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    // Build query
    const query = { product: { $in: productIds } };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (hasResponse === "true") {
      query["sellerResponse.comment"] = { $exists: true, $ne: null };
    } else if (hasResponse === "false") {
      query["sellerResponse.comment"] = { $exists: false };
    }

    if (search) {
      query.comment = { $regex: search, $options: "i" };
    }

    const reviews = await Review.find(query)
      .populate("user", "username email avatarURL")
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Review.countDocuments(query);

    // Calculate statistics
    const stats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          responded: {
            $sum: {
              $cond: [{ $ifNull: ["$sellerResponse.comment", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statistics =
      stats.length > 0
        ? stats[0]
        : {
            totalReviews: 0,
            averageRating: 0,
            responded: 0,
          };

    statistics.responseRate =
      statistics.totalReviews > 0
        ? ((statistics.responded / statistics.totalReviews) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: reviews,
      statistics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`Error getting seller reviews: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching seller reviews",
      error: error.message,
    });
  }
};

// @desc    Create a review
// @route   POST /api/v1/reviews
// @access  Private (Buyer)
exports.createReview = async (req, res) => {
  try {
    const { product, order, rating, comment, images } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Check if order exists and belongs to user
    let isVerifiedPurchase = false;
    if (order) {
      const orderDoc = await Order.findOne({
        _id: order,
        buyerId: req.user._id,
        status: "delivered",
      });

      if (orderDoc) {
        isVerifiedPurchase = true;
      }
    }

    // Create review
    const review = await Review.create({
      product,
      user: req.user._id,
      order,
      rating,
      comment,
      images: images || [],
      isVerifiedPurchase,
    });

    // Update product rating
    const productDoc = await Product.findById(product);
    if (productDoc) {
      const reviews = await Review.find({ product });
      const avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      productDoc.rating = avgRating;
      productDoc.totalReviews = reviews.length;
      await productDoc.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate("user", "username avatarURL")
      .populate("product", "title");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    logger.error(`Error creating review: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error creating review",
      error: error.message,
    });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private (Owner only)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const { rating, comment, images } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: review.product });
      const avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      product.rating = avgRating;
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    logger.error(`Error updating review: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Owner/Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      const reviews = await Review.find({ product: productId });
      if (reviews.length > 0) {
        const avgRating =
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        product.rating = avgRating;
        product.totalReviews = reviews.length;
      } else {
        product.rating = 0;
        product.totalReviews = 0;
      }
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting review: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// @desc    Add seller response to review
// @route   POST /api/v1/reviews/:id/response
// @access  Private (Seller - own products only)
exports.addSellerResponse = async (req, res) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id).populate("product");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if seller owns the product
    if (review.product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this review",
      });
    }

    review.sellerResponse = {
      comment,
      respondedAt: new Date(),
    };

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "username avatarURL")
      .populate("product", "title images");

    res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: populatedReview,
    });
  } catch (error) {
    logger.error(`Error adding seller response: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error adding response",
      error: error.message,
    });
  }
};

// @desc    Update seller response
// @route   PUT /api/v1/reviews/:id/response
// @access  Private (Seller - own products only)
exports.updateSellerResponse = async (req, res) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id).populate("product");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if seller owns the product
    if (review.product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this response",
      });
    }

    if (!review.sellerResponse || !review.sellerResponse.comment) {
      return res.status(404).json({
        success: false,
        message: "No existing response to update",
      });
    }

    review.sellerResponse.comment = comment;
    review.sellerResponse.respondedAt = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: "Response updated successfully",
      data: review,
    });
  } catch (error) {
    logger.error(`Error updating seller response: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error updating response",
      error: error.message,
    });
  }
};

// @desc    Delete seller response
// @route   DELETE /api/v1/reviews/:id/response
// @access  Private (Seller - own products only)
exports.deleteSellerResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("product");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if seller owns the product
    if (review.product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this response",
      });
    }

    review.sellerResponse = undefined;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Response deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting seller response: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting response",
      error: error.message,
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(req.user._id);

    if (alreadyMarked) {
      // Remove from helpful
      review.helpfulBy = review.helpfulBy.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      review.helpful = review.helpfulBy.length;
    } else {
      // Add to helpful
      review.helpfulBy.push(req.user._id);
      review.helpful = review.helpfulBy.length;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: alreadyMarked ? "Removed from helpful" : "Marked as helpful",
      data: { helpful: review.helpful },
    });
  } catch (error) {
    logger.error(`Error marking review as helpful: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
};
