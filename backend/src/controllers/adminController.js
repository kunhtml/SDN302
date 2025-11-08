const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Dispute = require("../models/Dispute");

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // Count users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Count products
    const totalProducts = await Product.countDocuments();

    // Count orders
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Count pending disputes
    const pendingDisputes = await Dispute.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingDisputes,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;

    const query = {};

    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      // Special role filter for pending seller requests
      if (role === "requests") {
        query.sellerVerificationStatus = "pending";
      } else {
        query.role = role;
      }
    }

    // Filter by status
    if (status) {
      query.isActive = status === "active";
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// @desc    Update user status
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "seller", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const update = { role };
    // If promoting to seller, mark seller flags
    if (role === "seller") {
      update.isSeller = true;
      update.sellerVerified = true;
      update.sellerVerificationStatus = "verified";
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const query = {};

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate("sellerId", "username email")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    // Search by order number or buyer name
    if (search) {
      const users = await require("../models/User")
        .find({
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id");

      const userIds = users.map((u) => u._id);

      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { buyerId: { $in: userIds } },
      ];
    }

    const orders = await Order.find(query)
      .populate("buyerId", "username email")
      .populate("items.product", "title")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// @desc    Get all disputes
// @route   GET /api/v1/admin/disputes
// @access  Private (Admin)
exports.getDisputes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate("orderId", "orderNumber totalPrice")
      .populate("buyer", "username email")
      .populate("seller", "username email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Dispute.countDocuments(query);

    res.status(200).json({
      success: true,
      data: disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disputes",
      error: error.message,
    });
  }
};

// @desc    Resolve dispute
// @route   PUT /api/v1/admin/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, refundAmount } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolution,
        refundAmount,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      },
      { new: true }
    );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dispute resolved successfully",
      data: dispute,
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve dispute",
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status
    order.status = status;

    // Update delivered date if status is delivered
    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // Update payment status if delivered
    if (status === "delivered" && order.paymentStatus === "pending") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// @desc    Get traffic analytics data
// @route   GET /api/v1/admin/stats/traffic
// @access  Private (Admin)
exports.getTrafficStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // day, month, year
    const now = new Date();
    let startDate, groupBy;

    // Determine date range and grouping based on period
    if (period === "day") {
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === "year") {
      // Last 12 months
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else {
      // Default: Last 7 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    // Get product views by period
    const viewsData = await Product.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          pageviews: { $sum: "$views" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get orders count by period
    const ordersData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          visits: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get unique users by period
    const usersData = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          unique: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create maps for easier lookup
    const viewsMap = {};
    viewsData.forEach((item) => {
      viewsMap[item._id] = item.pageviews;
    });

    const ordersMap = {};
    ordersData.forEach((item) => {
      ordersMap[item._id] = item.visits;
    });

    const usersMap = {};
    usersData.forEach((item) => {
      usersMap[item._id] = item.unique;
    });

    // Generate data for all periods (fill gaps with 0)
    const trafficData = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (period === "day") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        trafficData.push({
          month: dayName,
          date: dateStr,
          pageviews: viewsMap[dateStr] || 0,
          visits: ordersMap[dateStr] || 0,
          unique: usersMap[dateStr] || 0,
        });
      }
    } else if (period === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dateStr = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];

        trafficData.push({
          month: monthName,
          date: dateStr,
          pageviews: viewsMap[dateStr] || 0,
          visits: ordersMap[dateStr] || 0,
          unique: usersMap[dateStr] || 0,
        });
      }
    } else {
      // Default: Last 7 months
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dateStr = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];

        trafficData.push({
          month: monthName,
          date: dateStr,
          pageviews: viewsMap[dateStr] || 0,
          visits: ordersMap[dateStr] || 0,
          unique: usersMap[dateStr] || 0,
        });
      }
    }

    // Calculate totals
    const totalPageviews = trafficData.reduce(
      (sum, item) => sum + item.pageviews,
      0
    );
    const totalVisits = trafficData.reduce((sum, item) => sum + item.visits, 0);
    const totalUnique = trafficData.reduce((sum, item) => sum + item.unique, 0);

    res.status(200).json({
      success: true,
      data: trafficData,
      summary: {
        totalPageviews,
        totalVisits,
        totalUnique,
      },
    });
  } catch (error) {
    console.error("Error fetching traffic stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch traffic stats",
      error: error.message,
    });
  }
};
