const Product = require("../models/Product");
const logger = require("../config/logger");

// @desc    Get all products with filters, search, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      condition,
      isAuction,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Search by title, description, tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Filter by category
    if (category) {
      query.categoryId = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by condition
    if (condition) {
      query.condition = condition;
    }

    // Filter by auction
    if (isAuction) {
      query.isAuction = isAuction === "true";
    }

    // Sorting
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case "price-asc":
          sortOption = { price: 1 };
          break;
        case "price-desc":
          sortOption = { price: -1 };
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "popular":
          sortOption = { views: -1, sold: -1 };
          break;
        case "rating":
          sortOption = { rating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .populate("sellerId", "username email avatarURL")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    logger.error(`Error getting products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name slug description")
      .populate("sellerId", "username email avatarURL")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment views
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(`Error getting product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Seller only)
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller ID from authenticated user
    req.body.sellerId = req.user._id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller - own products only)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Seller - own products only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {},
    });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate("categoryId", "name slug")
      .populate("sellerId", "username email")
      .sort({ views: -1, rating: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    logger.error(`Error getting featured products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message,
    });
  }
};

// @desc    Get auction products
// @route   GET /api/v1/products/auctions
// @access  Public
exports.getAuctionProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      isAuction: true,
      auctionEndTime: { $gt: new Date() },
    })
      .populate("categoryId", "name slug")
      .populate("sellerId", "username email")
      .sort({ auctionEndTime: 1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    logger.error(`Error getting auction products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching auction products",
      error: error.message,
    });
  }
};
