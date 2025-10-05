const Joi = require("joi");

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    phone: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    phone: Joi.string().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

// Product validation schemas
const productSchemas = {
  create: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().max(5000).required(),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0).optional(),
    category: Joi.string()
      .valid(
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Sports",
        "Books",
        "Toys",
        "Beauty",
        "Automotive",
        "Food",
        "Other"
      )
      .required(),
    subCategory: Joi.string().optional(),
    stock: Joi.number().min(0).required(),
    condition: Joi.string().valid("new", "used", "refurbished").default("new"),
    brand: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    shippingInfo: Joi.object({
      weight: Joi.number().optional(),
      freeShipping: Joi.boolean().default(false),
      shippingCost: Joi.number().min(0).default(0),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().max(200).optional(),
    description: Joi.string().max(5000).optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).optional(),
    category: Joi.string()
      .valid(
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Sports",
        "Books",
        "Toys",
        "Beauty",
        "Automotive",
        "Food",
        "Other"
      )
      .optional(),
    subCategory: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
    condition: Joi.string().valid("new", "used", "refurbished").optional(),
    brand: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddressId: Joi.string().required(),
    paymentMethod: Joi.string().valid("paypal", "stripe", "cod").required(),
    couponCode: Joi.string().optional(),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid("processing", "confirmed", "shipped", "delivered", "cancelled")
      .required(),
    note: Joi.string().optional(),
    trackingNumber: Joi.string().optional(),
  }),
};

// Review validation schemas
const reviewSchemas = {
  create: Joi.object({
    product: Joi.string().required(),
    order: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).required(),
  }),
};

// Address validation schemas
const addressSchemas = {
  create: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default("Vietnam"),
    isDefault: Joi.boolean().default(false),
  }),
};

module.exports = {
  validate,
  userSchemas,
  productSchemas,
  orderSchemas,
  reviewSchemas,
  addressSchemas,
};
