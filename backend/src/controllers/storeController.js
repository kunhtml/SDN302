const Store = require("../models/Store");
const logger = require("../config/logger");

// @desc    Get store by ID
// @route   GET /api/v1/stores/:id
// @access  Public
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("sellerId", "username email avatarURL")
      .lean();

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    logger.error(`Error getting store: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching store",
      error: error.message,
    });
  }
};

// @desc    Get seller's store
// @route   GET /api/v1/stores/my-store
// @access  Private (Seller)
exports.getMyStore = async (req, res) => {
  try {
    let store = await Store.findOne({ sellerId: req.user._id }).lean();

    // If store doesn't exist, create a default one
    if (!store) {
      store = await Store.create({
        sellerId: req.user._id,
        storeName: `${req.user.username}'s Store`,
        description: "Welcome to my store!",
        email: req.user.email,
      });
    }

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    logger.error(`Error getting my store: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching store",
      error: error.message,
    });
  }
};

// @desc    Create store
// @route   POST /api/v1/stores
// @access  Private (Seller)
exports.createStore = async (req, res) => {
  try {
    // Check if user already has a store
    const existingStore = await Store.findOne({ sellerId: req.user._id });

    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "You already have a store",
      });
    }

    const store = await Store.create({
      ...req.body,
      sellerId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    logger.error(`Error creating store: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error creating store",
      error: error.message,
    });
  }
};

// @desc    Update store
// @route   PUT /api/v1/stores
// @access  Private (Seller)
exports.updateStore = async (req, res) => {
  try {
    let store = await Store.findOne({ sellerId: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Update fields
    const allowedFields = [
      "storeName",
      "description",
      "logo",
      "bannerImageURL",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "country",
      "zipCode",
      "socialLinks",
      "businessInfo",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });
  } catch (error) {
    logger.error(`Error updating store: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error updating store",
      error: error.message,
    });
  }
};

// @desc    Get all stores
// @route   GET /api/v1/stores
// @access  Public
exports.getStores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const stores = await Store.find(query)
      .populate("sellerId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      count: stores.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: stores,
    });
  } catch (error) {
    logger.error(`Error getting stores: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching stores",
      error: error.message,
    });
  }
};
