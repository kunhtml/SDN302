/**
 * MongoDB Schema Documentation
 * This file documents the MongoDB collections and their structures used in the eBay Clone application
 */

// ===========================
// 1. USER COLLECTION
// ===========================
const userSchema = {
  _id: "ObjectId",
  username: "String",
  email: "String (unique)",
  password: "String (hashed)",
  role: "String (admin, seller, buyer)",
  isActive: "Boolean",
  avatarURL: "String (image URL from FreeImage.host)",
  firstName: "String",
  lastName: "String",
  phone: "String",
  bio: "String",
  addresses: [
    {
      _id: "ObjectId",
      fullName: "String",
      phone: "String",
      street: "String",
      city: "String",
      state: "String",
      country: "String",
      postalCode: "String",
      isDefault: "Boolean",
    },
  ],
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 2. PRODUCT COLLECTION
// ===========================
const productSchema = {
  _id: "ObjectId",
  title: "String",
  description: "String",
  price: "Number (Decimal)",
  images: ["String (image URLs)"],
  category: "String",
  seller: "ObjectId (reference to User)",
  isAuction: "Boolean",
  auctionEndTime: "Date",
  quantity: "Number",
  status: "String (active, inactive, sold)",
  ratings: {
    average: "Number",
    count: "Number",
  },
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 3. ORDER COLLECTION
// ===========================
const orderSchema = {
  _id: "ObjectId",
  buyer: "ObjectId (reference to User)",
  items: [
    {
      product: "ObjectId (reference to Product)",
      quantity: "Number",
      price: "Number",
    },
  ],
  shippingAddress: {
    fullName: "String",
    phone: "String",
    street: "String",
    city: "String",
    state: "String",
    country: "String",
    postalCode: "String",
  },
  totalPrice: "Number (Decimal)",
  status: "String (pending, processing, shipped, delivered, cancelled)",
  payment: {
    method: "String",
    status: "String (pending, completed, failed)",
    transactionId: "String",
  },
  shipping: {
    carrier: "String",
    trackingNumber: "String",
    estimatedArrival: "Date",
  },
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 4. CART COLLECTION
// ===========================
const cartSchema = {
  _id: "ObjectId",
  user: "ObjectId (reference to User)",
  items: [
    {
      product: "ObjectId (reference to Product)",
      quantity: "Number",
      price: "Number",
    },
  ],
  totalPrice: "Number",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 5. REVIEW COLLECTION
// ===========================
const reviewSchema = {
  _id: "ObjectId",
  product: "ObjectId (reference to Product)",
  reviewer: "ObjectId (reference to User)",
  rating: "Number (1-5)",
  comment: "String",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 6. BID COLLECTION
// ===========================
const bidSchema = {
  _id: "ObjectId",
  product: "ObjectId (reference to Product)",
  bidder: "ObjectId (reference to User)",
  amount: "Number (Decimal)",
  createdAt: "Date",
};

// ===========================
// 7. COUPON COLLECTION
// ===========================
const couponSchema = {
  _id: "ObjectId",
  code: "String (unique)",
  discountPercent: "Number",
  discountAmount: "Number",
  startDate: "Date",
  endDate: "Date",
  maxUsage: "Number",
  usageCount: "Number",
  applicableProducts: ["ObjectId"],
  applicableCategories: ["String"],
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 8. CATEGORY COLLECTION
// ===========================
const categorySchema = {
  _id: "ObjectId",
  name: "String",
  description: "String",
  icon: "String (image URL)",
  parentCategory: "ObjectId (reference to Category)",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 9. STORE COLLECTION
// ===========================
const storeSchema = {
  _id: "ObjectId",
  seller: "ObjectId (reference to User)",
  storeName: "String",
  description: "String",
  bannerImageURL: "String (image URL from FreeImage.host)",
  storeLogoURL: "String (image URL from FreeImage.host)",
  followers: ["ObjectId (references to User)"],
  rating: "Number",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 10. FEEDBACK COLLECTION
// ===========================
const feedbackSchema = {
  _id: "ObjectId",
  seller: "ObjectId (reference to User)",
  averageRating: "Number (Decimal)",
  totalReviews: "Number",
  positiveRate: "Number (Percentage)",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 11. DISPUTE COLLECTION
// ===========================
const disputeSchema = {
  _id: "ObjectId",
  order: "ObjectId (reference to Order)",
  raisedBy: "ObjectId (reference to User)",
  description: "String",
  status: "String (open, in_progress, resolved, closed)",
  resolution: "String",
  resolutionDate: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 12. CHAT COLLECTION
// ===========================
const chatSchema = {
  _id: "ObjectId",
  participants: ["ObjectId (references to User)"],
  messages: [
    {
      sender: "ObjectId (reference to User)",
      content: "String",
      timestamp: "Date",
      read: "Boolean",
    },
  ],
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 13. NOTIFICATION COLLECTION
// ===========================
const notificationSchema = {
  _id: "ObjectId",
  user: "ObjectId (reference to User)",
  type: "String (order, message, bid, review, coupon)",
  title: "String",
  message: "String",
  relatedId: "ObjectId (related document ID)",
  read: "Boolean",
  createdAt: "Date",
};

// ===========================
// 14. RETURN REQUEST COLLECTION
// ===========================
const returnRequestSchema = {
  _id: "ObjectId",
  order: "ObjectId (reference to Order)",
  user: "ObjectId (reference to User)",
  reason: "String",
  description: "String",
  status: "String (pending, approved, rejected, completed)",
  refundAmount: "Number (Decimal)",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 15. INVENTORY COLLECTION
// ===========================
const inventorySchema = {
  _id: "ObjectId",
  product: "ObjectId (reference to Product)",
  quantity: "Number",
  reserved: "Number (for pending orders)",
  lastUpdated: "Date",
};

// ===========================
// 16. SHIPPING INFO COLLECTION
// ===========================
const shippingInfoSchema = {
  _id: "ObjectId",
  order: "ObjectId (reference to Order)",
  carrier: "String",
  trackingNumber: "String",
  status: "String (processing, shipped, in_transit, delivered)",
  estimatedArrival: "Date",
  actualArrival: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

// ===========================
// 17. PAYMENT COLLECTION
// ===========================
const paymentSchema = {
  _id: "ObjectId",
  order: "ObjectId (reference to Order)",
  user: "ObjectId (reference to User)",
  amount: "Number (Decimal)",
  method: "String (credit_card, debit_card, paypal, etc)",
  status: "String (pending, completed, failed, refunded)",
  transactionId: "String",
  paidAt: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

module.exports = {
  userSchema,
  productSchema,
  orderSchema,
  cartSchema,
  reviewSchema,
  bidSchema,
  couponSchema,
  categorySchema,
  storeSchema,
  feedbackSchema,
  disputeSchema,
  chatSchema,
  notificationSchema,
  returnRequestSchema,
  inventorySchema,
  shippingInfoSchema,
  paymentSchema,
};
