const User = require("../models/User");
const logger = require("../config/logger");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Email Verification",
        html: `<p>Please verify your email by clicking this link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
      });
    } catch (error) {
      logger.error(`Email send error: ${error.message}`);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
