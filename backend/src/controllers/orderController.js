const Order = require("../models/Order");
const Product = require("../models/Product");
const logger = require("../config/logger");

// @desc    Get all orders for authenticated user
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const query = { buyerId: req.user._id };

    const orders = await Order.find(query)
      .populate("items.product", "title images price")
      .populate("items.seller", "username email")
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

    // Find orders that contain items from this seller
    const query = { "items.seller": req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("buyerId", "username email avatarURL")
      .populate("items.product", "title images price")
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
      .populate("buyerId", "username email avatarURL addresses")
      .populate("items.seller", "username email")
      .populate("items.product", "title images price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order or is the seller
    const isBuyer = order.buyerId._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(
      (item) =>
        item.seller && item.seller._id.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isSeller && req.user.role !== "admin") {
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
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes,
    } = req.body;

    console.log("Received order data:", {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    // Validate required fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Create order
    const order = await Order.create({
      buyerId: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
      notes: notes || "",
      status: "pending",
      paymentStatus: "pending",
    });

    console.log("Order created:", order._id);

    // Populate the order before sending response
    await order.populate([
      { path: "buyerId", select: "username email" },
      { path: "items.product", select: "title images price" },
    ]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    console.error("Order creation error:", error);
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

    // Check authorization - seller can update if they have items in this order
    const isSeller = order.items.some(
      (item) => item.seller && item.seller.toString() === req.user._id.toString()
    );

    if (!isSeller && req.user.role !== "admin") {
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
