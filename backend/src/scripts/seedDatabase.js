const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
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

// Import data from JSON files
const categoriesData = require(path.join(
  __dirname,
  "../../../database/categories.json"
));
const couponData = require(path.join(
  __dirname,
  "../../../database/coupons.json"
));
const sampleProductData = require(path.join(
  __dirname,
  "../../../database/sampleProducts.json"
));

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
    // Drop collections to remove old indexes
    const collections = [
      "users",
      "categories",
      "products",
      "stores",
      "orders",
      "reviews",
      "coupons",
      "inventories",
      "feedbacks",
      "bids",
      "payments",
    ];

    for (const collection of collections) {
      try {
        await mongoose.connection.collection(collection).drop();
      } catch (err) {
        // Collection might not exist, that's fine
        if (err.code !== 26) {
          // 26 = namespace not found
          console.warn(`Warning dropping ${collection}:`, err.message);
        }
      }
    }
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
    const hashedPassword3 = await bcrypt.hash("seller123", 10);
    const hashedPassword4 = await bcrypt.hash("buyer123", 10);
    const hashedPassword5 = await bcrypt.hash("buyer123", 10);

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
        isSeller: true,
        sellerVerified: true,
      },
      {
        email: "seller2@ebay.com",
        password: hashedPassword3,
        firstName: "Alice",
        lastName: "Vendor",
        phone: "0123456781",
        role: "seller",
        isActive: true,
        emailVerified: true,
        isSeller: true,
        sellerVerified: true,
      },
      {
        email: "buyer1@ebay.com",
        password: hashedPassword4,
        firstName: "Jane",
        lastName: "Buyer",
        phone: "0987654321",
        role: "buyer",
        isActive: true,
        emailVerified: true,
      },
      {
        email: "buyer2@ebay.com",
        password: hashedPassword5,
        firstName: "Bob",
        lastName: "Shopper",
        phone: "0987654322",
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
    const categories = categoriesData.categories || [];

    if (categories.length === 0) {
      console.log("✅ Categories seeded successfully! (0 categories)");
      return [];
    }

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
    const stores = sellers.map((seller, idx) => ({
      sellerId: seller._id,
      storeName: seller.firstName
        ? `${seller.firstName}'s Store`
        : `Seller ${idx + 1} Store`,
      description: "Your one-stop shop for quality products",
      phone: seller.phone || "0123456789",
      email: seller.email,
      address: "123 Market St",
      city: "Hanoi",
      state: "HN",
      country: "Vietnam",
      zipCode: "100000",
      isVerified: true,
      slug: (seller.email.split("@")[0] + "-store").toLowerCase(),
    }));

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
    const products = sampleProductData.sampleProducts || [];

    if (products.length === 0) {
      console.log("✅ Products seeded successfully! (0 products)");
      return [];
    }

    // Map category name to category ID
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    // Map seller email to seller ID
    const sellerMap = {};
    sellers.forEach((seller) => {
      if (seller.role === "seller") {
        sellerMap[seller.email] = seller._id;
      }
    });

    // Update products with proper IDs and convert images array to string
    const productsToSeed = products.map((product) => ({
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      images: Array.isArray(product.images)
        ? product.images.join(",")
        : product.images,
      categoryId: categoryMap[product.category] || categories[0]._id,
      sellerId: sellerMap["seller1@ebay.com"] || sellers[1]._id,
      isAuction: product.isAuction || false,
      isActive: product.status === "active" ? true : false,
      condition: "new",
      brand: product.brand || "",
    }));

    const createdProducts = await Product.insertMany(productsToSeed);
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
    const inventory = products.map((p) => ({
      productId: p._id,
      quantity: p.quantity || 0,
      lowStockThreshold: 5,
      reorderQuantity: 20,
    }));

    await Inventory.insertMany(inventory);
    console.log("✅ Inventory seeded successfully!");
  } catch (error) {
    console.error("Error seeding inventory:", error);
    throw error;
  }
};

// Seed Coupons
const seedCoupons = async (categories) => {
  try {
    const coupons = couponData.coupons || [];

    if (coupons.length === 0) {
      console.log("✅ Coupons seeded successfully! (0 coupons)");
      return;
    }

    // Map category names to category IDs
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    // Update coupons with proper data structure
    const couponsToSeed = coupons.map((coupon) => {
      const discountType =
        coupon.discountAmount > 0 && coupon.discountPercent === 0
          ? "fixed"
          : "percentage";
      const discountValue = coupon.discountAmount || coupon.discountPercent;
      const applicableCategories =
        coupon.applicableCategories?.map((cat) => categoryMap[cat]) || [];

      return {
        code: coupon.code,
        description: coupon.description,
        discountType: discountType,
        discountValue: discountValue,
        startDate: new Date(coupon.startDate),
        endDate: new Date(coupon.endDate),
        maxUsage: coupon.maxUsage || null,
        usedCount: coupon.usageCount || 0,
        applicableCategories: applicableCategories,
        isActive: true,
      };
    });

    await Coupon.insertMany(couponsToSeed);
    console.log("✅ Coupons seeded successfully!");
  } catch (error) {
    console.error("Error seeding coupons:", error);
    throw error;
  }
};

// Seed Reviews (requires orders for verified purchase)
const seedReviews = async (orders) => {
  try {
    const reviews = [];

    for (const order of orders) {
      for (const item of order.items) {
        reviews.push({
          product: item.product,
          user: order.buyerId,
          order: order._id,
          rating: 4 + Math.round(Math.random()), // 4 or 5
          comment: `Great ${item.name.toLowerCase()}! Very satisfied.`,
          isVerifiedPurchase: true,
        });
      }
    }

    let createdReviews = [];
    if (reviews.length > 0) {
      createdReviews = await Review.insertMany(reviews);
    }
    console.log("✅ Reviews seeded successfully!");
    return createdReviews;
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

// Seed Feedback for sellers based on reviews and orders
const seedFeedback = async (sellers, products, orders, reviews) => {
  try {
    if (!sellers?.length) {
      console.log("⚠️ No sellers found to seed feedback");
      return [];
    }

    // Map productId -> sellerId for quick lookup
    const productSellerMap = new Map(
      products.map((p) => [String(p._id), String(p.sellerId)])
    );

    // Initialize aggregates per seller
    const agg = new Map(
      sellers.map((s) => [
        String(s._id),
        {
          sellerId: s._id,
          averageRating: 0,
          totalReviews: 0,
          positiveRate: 0,
          ratingDistribution: {
            oneStar: 0,
            twoStar: 0,
            threeStar: 0,
            fourStar: 0,
            fiveStar: 0,
          },
          totalSales: 0,
          responseRate: 90 + Math.floor(Math.random() * 10), // demo 90-99%
          responseTime: 2 + Math.floor(Math.random() * 6), // demo 2-7 hours
          onTimeDeliveryRate: 92 + Math.floor(Math.random() * 8), // 92-99%
        },
      ])
    );

    // Accumulate review stats
    for (const r of reviews || []) {
      const sellerId = productSellerMap.get(String(r.product));
      if (!sellerId) continue;
      const a = agg.get(String(sellerId));
      if (!a) continue;
      a.totalReviews += 1;
      const key =
        [null, "oneStar", "twoStar", "threeStar", "fourStar", "fiveStar"][
          r.rating
        ] || "threeStar";
      a.ratingDistribution[key] += 1;
    }

    // Compute average and positive rate
    for (const a of agg.values()) {
      const total = a.totalReviews || 0;
      if (total > 0) {
        const sum =
          a.ratingDistribution.oneStar * 1 +
          a.ratingDistribution.twoStar * 2 +
          a.ratingDistribution.threeStar * 3 +
          a.ratingDistribution.fourStar * 4 +
          a.ratingDistribution.fiveStar * 5;
        a.averageRating = sum / total;
        const positive =
          a.ratingDistribution.fourStar + a.ratingDistribution.fiveStar;
        a.positiveRate = (positive / total) * 100;
      }
    }

    // Accumulate totalSales from orders per seller
    for (const order of orders || []) {
      for (const item of order.items || []) {
        const a = agg.get(String(item.seller));
        if (a) a.totalSales += item.quantity;
      }
    }

    const feedbackDocs = Array.from(agg.values());
    if (feedbackDocs.length) {
      await Feedback.insertMany(feedbackDocs);
    }
    console.log("✅ Feedback seeded successfully!");
    return feedbackDocs;
  } catch (error) {
    console.error("Error seeding feedback:", error);
    throw error;
  }
};

// Seed Orders
const seedOrders = async (products, buyers) => {
  try {
    const [buyer1, buyer2] = buyers;
    if (!buyer1 || products.length === 0) {
      console.log("⚠️ Not enough data to seed orders");
      return [];
    }

    const getImg = (p) => {
      if (!p.images) return "https://via.placeholder.com/600x600?text=Product";
      const arr = typeof p.images === "string" ? p.images.split(",") : p.images;
      return Array.isArray(arr) ? arr[0] : arr;
    };

    const p1 = products[0];
    const p2 = products[1] || products[0];
    const p3 = products[2] || products[0];

    const orders = [
      {
        buyerId: buyer1._id,
        items: [
          {
            product: p1._id,
            name: p1.title,
            quantity: 1,
            price: p1.price,
            image: getImg(p1),
            seller: p1.sellerId,
          },
          {
            product: p2._id,
            name: p2.title,
            quantity: 2,
            price: p2.price,
            image: getImg(p2),
            seller: p2.sellerId,
          },
        ],
        shippingAddress: {
          fullName: "Jane Buyer",
          phone: "0987654321",
          street: "456 Buyer Rd",
          city: "Hanoi",
          state: "HN",
          zipCode: "100000",
          country: "Vietnam",
        },
        paymentMethod: "cod",
        itemsPrice: p1.price * 1 + p2.price * 2,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: p1.price * 1 + p2.price * 2,
        status: "processing",
        paymentStatus: "pending",
      },
      {
        buyerId: buyer2?._id || buyer1._id,
        items: [
          {
            product: p3._id,
            name: p3.title,
            quantity: 1,
            price: p3.price,
            image: getImg(p3),
            seller: p3.sellerId,
          },
        ],
        shippingAddress: {
          fullName: "Bob Shopper",
          phone: "0987654322",
          street: "789 Market Ave",
          city: "HCMC",
          state: "HCM",
          zipCode: "700000",
          country: "Vietnam",
        },
        paymentMethod: "paypal",
        itemsPrice: p3.price,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: p3.price,
        status: "pending",
        paymentStatus: "paid",
      },
    ];

    const createdOrders = [];
    for (const data of orders) {
      const order = await Order.create(data);
      createdOrders.push(order);
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
    const sellers = users.filter((u) => u.role === "seller");
    const buyers = users.filter((u) => u.role === "buyer");

    const categories = await seedCategories();
    const stores = await seedStores(sellers);
    const products = await seedProducts(categories, sellers);
    await seedInventory(products);
    await seedCoupons(categories);
    const orders = await seedOrders(products, buyers);
    const reviews = await seedReviews(orders);
    await seedBids(products, buyers);
    const feedback = await seedFeedback(sellers, products, orders, reviews);

    // Dynamic counts
    const couponCount = await Coupon.countDocuments();
    const reviewCount = await Review.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Stores: ${stores.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Inventory items: ${products.length}`);
    console.log(`   - Coupons: ${couponCount}`);
    console.log(`   - Reviews: ${reviewCount}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Feedback records: ${feedbackCount}`);

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
