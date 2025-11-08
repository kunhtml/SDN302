const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

// Protect routes - Authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account is deactivated",
        });
      }

      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is a verified seller
exports.isVerifiedSeller = async (req, res, next) => {
  try {
    // Check if user has seller role
    if (req.user.role === "seller") {
      // For role-based system, just check if role is seller
      // (role switching already auto-verifies)
      return next();
    }

    // Check old isSeller system (for backward compatibility)
    if (req.user.isSeller && req.user.sellerVerified) {
      return next();
    }

    // User is not a seller
    return res.status(403).json({
      success: false,
      message: "You must be a verified seller to access this route",
    });
  } catch (error) {
    logger.error(`Seller verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Check if user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (error) {
    logger.error(`Admin verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
