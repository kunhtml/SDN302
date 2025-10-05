const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "title price images quantity condition brand",
  });

  if (!cart) {
    // Create empty cart if doesn't exist
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  res.json({
    success: true,
    data: {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: subtotal,
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if product has enough stock
  if (product.quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.quantity} items available in stock`,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity: quantity,
        },
      ],
    });
  } else {
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check stock
      if (product.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items available in stock`,
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: quantity,
      });
    }

    await cart.save();
  }

  // Populate and return updated cart
  await cart.populate({
    path: "items.product",
    select: "title price images quantity condition brand",
  });

  const subtotal = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  res.json({
    success: true,
    message: "Item added to cart",
    data: {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: subtotal,
    },
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/items/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  // Check product stock
  const product = await Product.findById(cart.items[itemIndex].product);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (product.quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.quantity} items available in stock`,
    });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "title price images quantity condition brand",
  });

  const subtotal = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  res.json({
    success: true,
    message: "Cart item updated",
    data: {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: subtotal,
    },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "title price images quantity condition brand",
  });

  const subtotal = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  res.json({
    success: true,
    message: "Item removed from cart",
    data: {
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: subtotal,
    },
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared",
    data: {
      items: [],
      totalItems: 0,
      subtotal: 0,
    },
  });
});
