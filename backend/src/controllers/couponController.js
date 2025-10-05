const Coupon = require("../models/Coupon");
const Product = require("../models/Product");

// @desc    Get all coupons for seller
// @route   GET /api/v1/coupons/seller
// @access  Private (Seller)
exports.getSellerCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ seller: req.user._id })
      .populate("applicableProducts", "title images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching seller coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/v1/coupons
// @access  Private (Seller)
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      maxUsage,
      productIds,
      description,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, and discount value are required",
      });
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 0 and 100",
      });
    }

    if (discountType === "fixed" && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Fixed discount must be greater than 0",
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
      seller: req.user._id,
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Validate products if specified
    if (productIds && productIds.length > 0) {
      const products = await Product.find({
        _id: { $in: productIds },
        sellerId: req.user._id,
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some products are invalid or do not belong to you",
        });
      }
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchase || 0,
      maxDiscountAmount: maxDiscount || null,
      startDate: startDate || new Date(),
      endDate,
      maxUsage: maxUsage || null,
      applicableProducts: productIds || [],
      seller: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private (Seller)
exports.updateCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      maxUsage,
      productIds,
      description,
    } = req.body;

    // Find coupon
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check ownership
    if (coupon.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this coupon",
      });
    }

    // Validate discount value if provided
    if (discountType === "percentage" && discountValue && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 0 and 100",
      });
    }

    if (discountType === "fixed" && discountValue && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Fixed discount must be greater than 0",
      });
    }

    // Check if code is being changed and already exists
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase(),
        seller: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
    }

    // Validate products if specified
    if (productIds && productIds.length > 0) {
      const products = await Product.find({
        _id: { $in: productIds },
        sellerId: req.user._id,
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some products are invalid or do not belong to you",
        });
      }
    }

    // Update coupon
    coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: code ? code.toUpperCase() : coupon.code,
        description: description !== undefined ? description : coupon.description,
        discountType: discountType || coupon.discountType,
        discountValue: discountValue !== undefined ? discountValue : coupon.discountValue,
        minPurchaseAmount: minPurchase !== undefined ? minPurchase : coupon.minPurchaseAmount,
        maxDiscountAmount: maxDiscount !== undefined ? maxDiscount : coupon.maxDiscountAmount,
        startDate: startDate || coupon.startDate,
        endDate: endDate || coupon.endDate,
        maxUsage: maxUsage !== undefined ? maxUsage : coupon.maxUsage,
        applicableProducts: productIds !== undefined ? productIds : coupon.applicableProducts,
      },
      { new: true, runValidators: true }
    ).populate("applicableProducts", "title images");

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private (Seller)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check ownership
    if (coupon.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this coupon",
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};

// @desc    Get coupon by code (for buyers)
// @route   GET /api/v1/coupons/validate/:code
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { productIds, totalAmount } = req.query;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).populate("applicableProducts", "_id");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or inactive",
      });
    }

    // Check date validity
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not yet valid",
      });
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Check minimum purchase
    if (totalAmount && coupon.minPurchaseAmount > parseFloat(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is $${coupon.minPurchaseAmount}`,
      });
    }

    // Check product applicability
    if (coupon.applicableProducts.length > 0 && productIds) {
      const requestedProductIds = productIds.split(",");
      const applicableProductIds = coupon.applicableProducts.map((p) => p._id.toString());
      const hasApplicableProduct = requestedProductIds.some((id) =>
        applicableProductIds.includes(id)
      );

      if (!hasApplicableProduct) {
        return res.status(400).json({
          success: false,
          message: "Coupon is not applicable to these products",
        });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (parseFloat(totalAmount) * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Math.round(discount * 100) / 100,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message,
    });
  }
};

// @desc    Apply coupon to order
// @route   POST /api/v1/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, orderId } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or inactive",
      });
    }

    // Validate coupon (date, usage, etc.)
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not yet valid",
      });
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Update usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};
