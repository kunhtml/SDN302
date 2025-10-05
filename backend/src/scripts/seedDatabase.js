const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Store = require("../models/Store");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const Inventory = require("../models/Inventory");
const Feedback = require("../models/Feedback");
const Bid = require("../models/Bid");
const Payment = require("../models/Payment");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ebay-clone",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Store.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Inventory.deleteMany({});
    await Feedback.deleteMany({});
    await Bid.deleteMany({});
    await Payment.deleteMany({});
    console.log("🗑️  Database cleared!");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    // Hash passwords manually since insertMany doesn't trigger pre-save hooks
    const hashedPassword1 = await bcrypt.hash("admin123", 10);
    const hashedPassword2 = await bcrypt.hash("seller123", 10);
    const hashedPassword3 = await bcrypt.hash("buyer123", 10);

    const users = [
      {
        email: "admin@ebay.com",
        password: hashedPassword1,
        firstName: "Admin",
        lastName: "User",
        phone: "0123456789",
        role: "admin",
        isActive: true,
        emailVerified: true,
      },
      {
        email: "seller1@ebay.com",
        password: hashedPassword2,
        firstName: "John",
        lastName: "Seller",
        phone: "0123456780",
        role: "seller",
        isActive: true,
        emailVerified: true,
      },
      {
        email: "buyer1@ebay.com",
        password: hashedPassword3,
        firstName: "Jane",
        lastName: "Buyer",
        phone: "0987654321",
        role: "buyer",
        isActive: true,
        emailVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("✅ Users seeded successfully!");
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};

// Seed Categories
const seedCategories = async () => {
  try {
    const categories = [];

    const createdCategories = await Category.insertMany(categories);
    console.log("✅ Categories seeded successfully!");
    return createdCategories;
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};

// Seed Stores
const seedStores = async (sellers) => {
  try {
    const stores = [];

    const createdStores = await Store.insertMany(stores);
    console.log("✅ Stores seeded successfully!");
    return createdStores;
  } catch (error) {
    console.error("Error seeding stores:", error);
    throw error;
  }
};

// Seed Products
const seedProducts = async (categories, sellers) => {
  try {
    const products = [];

    const createdProducts = await Product.insertMany(products);
    console.log("✅ Products seeded successfully!");
    return createdProducts;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
};

// Seed Inventory
const seedInventory = async (products) => {
  try {
    const inventory = [];

    await Inventory.insertMany(inventory);
    console.log("✅ Inventory seeded successfully!");
  } catch (error) {
    console.error("Error seeding inventory:", error);
    throw error;
  }
};

// Seed Coupons
const seedCoupons = async (products, sellers) => {
  try {
    const coupons = [];

    await Coupon.insertMany(coupons);
    console.log("✅ Coupons seeded successfully!");
  } catch (error) {
    console.error("Error seeding coupons:", error);
    throw error;
  }
};

// Seed Reviews
const seedReviews = async (products, buyers) => {
  try {
    const reviews = [];

    await Review.insertMany(reviews);
    console.log("✅ Reviews seeded successfully!");
  } catch (error) {
    console.error("Error seeding reviews:", error);
    throw error;
  }
};

// Seed Bids for auction products
const seedBids = async (products, buyers) => {
  try {
    const bids = [];

    await Bid.insertMany(bids);
    console.log("✅ Bids seeded successfully!");
  } catch (error) {
    console.error("Error seeding bids:", error);
    throw error;
  }
};

// Seed Feedback for sellers
const seedFeedback = async (sellers) => {
  try {
    const feedback = [];

    await Feedback.insertMany(feedback);
    console.log("✅ Feedback seeded successfully!");
  } catch (error) {
    console.error("Error seeding feedback:", error);
    throw error;
  }
};

// Seed Orders
const seedOrders = async (products, buyers, sellers) => {
  try {
    const orders = [];

    const createdOrders = [];
    for (const orderData of orders) {
      const order = await Order.create(orderData);
      createdOrders.push(order);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    console.log("✅ Orders seeded successfully!");
    return createdOrders;
  } catch (error) {
    console.error("Error seeding orders:", error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();
    await clearDatabase();

    console.log("\n📦 Creating sample data...\n");

    const users = await seedUsers();
    const admin = users[0];
    const sellers = [users[1], users[2]];
    const buyers = [users[3], users[4]];

    const categories = await seedCategories();
    const stores = await seedStores(sellers);
    const products = await seedProducts(categories, sellers);
    await seedInventory(products);
    await seedCoupons(products, sellers);
    await seedReviews(products, buyers);
    await seedBids(products, buyers);
    await seedFeedback(sellers);
    const orders = await seedOrders(products, buyers, sellers);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Stores: ${stores.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Inventory items: ${products.length}`);
    console.log(`   - Coupons: 0`);
    console.log(`   - Reviews: 0`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Feedback records: 0`);

    console.log("\n👥 Test Accounts:");
    console.log("   📧 Admin:  admin@ebay.com  | 🔑 Password: admin123");
    console.log("   📧 Seller: seller1@ebay.com | 🔑 Password: seller123");
    console.log("   📧 Buyer:  buyer1@ebay.com  | 🔑 Password: buyer123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
