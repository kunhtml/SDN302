const Order = require("../models/Order");
const Product = require("../models/Product");
const logger = require("../config/logger");

// @desc    Get all orders for authenticated user
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const query = { userId: req.user._id };
    
    const orders = await Order.find(query)
      .populate("products.productId", "title images price")
      .populate("sellerId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    logger.error(`Error getting orders: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get seller orders
// @route   GET /api/v1/orders/seller
// @access  Private (Seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { sellerId: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("userId", "username email avatarURL")
      .populate("products.productId", "title images price")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    logger.error(`Error getting seller orders: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email avatarURL addresses")
      .populate("sellerId", "username email")
      .populate("products.productId", "title images price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order or is the seller
    if (
      order.userId._id.toString() !== req.user._id.toString() &&
      order.sellerId?._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error(`Error getting order: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingFee,
    } = req.body;

    // Validate products
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingFee,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (
      order.sellerId?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    logger.error(`Error updating order: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error cancelling order: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
