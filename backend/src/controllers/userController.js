const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { username, email, phone, bio, avatarURL } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
  }

  // Check if username is already taken by another user
  if (username && username !== user.username) {
    const usernameExists = await User.findOne({
      username,
      _id: { $ne: user._id },
    });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already in use",
      });
    }
  }

  // Update fields
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (avatarURL !== undefined) user.avatarURL = avatarURL;

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// @desc    Update user password
// @route   PUT /api/v1/users/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if current password is correct
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Validate new password length
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc    Get user addresses
// @route   GET /api/v1/users/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: user.addresses || [],
  });
});

// @desc    Add user address
// @route   POST /api/v1/users/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res) => {
  const { street, city, state, zipCode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // If this is the default address, set all others to non-default
  if (isDefault) {
    user.addresses = user.addresses.map((addr) => ({
      ...addr,
      isDefault: false,
    }));
  }

  // Add new address
  const newAddress = {
    street,
    city,
    state,
    zipCode,
    country,
    isDefault: isDefault || user.addresses.length === 0, // First address is default
  };

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc    Switch user role (Buyer <-> Seller)
// @route   POST /api/v1/users/switch-role
// @access  Private
exports.switchRole = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;

  // Validate target role
  if (!["user", "seller"].includes(targetRole)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Only 'user' and 'seller' roles are allowed.",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Admin cannot switch to user/seller
  if (user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin accounts cannot switch roles",
    });
  }

  // Check if already in target role
  if (user.role === targetRole) {
    return res.status(400).json({
      success: false,
      message: `You are already in ${targetRole} mode`,
    });
  }

  // For switching to seller, check if user has completed profile
  if (targetRole === "seller") {
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your profile (add phone number) before switching to seller mode",
      });
    }

    // Check if user has verification pending
    if (user.sellerVerificationStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Your seller verification is pending approval",
      });
    }

    // Auto-approve seller verification for now (in production, this should be manual)
    user.sellerVerificationStatus = "verified";
  }

  // Switch role
  const previousRole = user.role;
  user.role = targetRole;
  await user.save();

  // Generate new token with updated role
  const token = user.getSignedJwtToken();

  const userData = user.toObject();
  delete userData.password;

  res.json({
    success: true,
    message: `Successfully switched from ${previousRole} to ${targetRole} mode`,
    data: {
      user: userData,
      token,
    },
  });
});

// @desc    Request to become a seller
// @route   POST /api/v1/users/request-seller
// @access  Private
exports.requestSeller = asyncHandler(async (req, res) => {
  const { businessName, businessAddress, phoneNumber, description } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if already a seller
  if (user.role === "seller") {
    return res.status(400).json({
      success: false,
      message: "You are already a seller",
    });
  }

  // Check if already admin
  if (user.role === "admin") {
    return res.status(400).json({
      success: false,
      message: "Admin accounts cannot become sellers",
    });
  }

  // Check if verification is pending
  if (user.sellerVerificationStatus === "pending") {
    return res.status(400).json({
      success: false,
      message: "Your seller request is already pending approval",
    });
  }

  // Update user with seller request info
  if (phoneNumber) user.phone = phoneNumber;
  if (description) user.bio = description;
  // Mark request as pending for admin review
  user.sellerVerificationStatus = "pending";

  await user.save();

  const userData = user.toObject();
  delete userData.password;

  res.json({
    success: true,
    message:
      "Your request to become a seller has been submitted and is pending admin approval.",
    data: {
      user: userData,
    },
  });
});
