const Category = require("../models/Category");
const logger = require("../config/logger");

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    logger.error(`Error getting categories: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error(`Error getting category: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};
