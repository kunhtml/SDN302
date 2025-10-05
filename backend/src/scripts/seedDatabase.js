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
    const users = [
      {
        username: "admin",
        email: "admin@ebay.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        avatarURL: "https://i.pravatar.cc/150?img=1",
        isEmailVerified: true,
        isActive: true,
      },
      {
        username: "seller1",
        email: "seller1@ebay.com",
        password: await bcrypt.hash("seller123", 10),
        role: "seller",
        avatarURL: "https://i.pravatar.cc/150?img=2",
        isSeller: true,
        sellerVerified: true,
        isEmailVerified: true,
        isActive: true,
        addresses: [
          {
            fullName: "John Seller",
            phone: "0901234567",
            street: "123 Seller Street",
            city: "Ho Chi Minh",
            state: "HCM",
            country: "Vietnam",
            zipCode: "700000",
            isDefault: true,
          },
        ],
      },
      {
        username: "seller2",
        email: "seller2@ebay.com",
        password: await bcrypt.hash("seller123", 10),
        role: "seller",
        avatarURL: "https://i.pravatar.cc/150?img=3",
        isSeller: true,
        sellerVerified: true,
        isEmailVerified: true,
        isActive: true,
        addresses: [
          {
            fullName: "Jane Seller",
            phone: "0902345678",
            street: "456 Seller Avenue",
            city: "Hanoi",
            state: "HN",
            country: "Vietnam",
            zipCode: "100000",
            isDefault: true,
          },
        ],
      },
      {
        username: "buyer1",
        email: "buyer1@ebay.com",
        password: await bcrypt.hash("buyer123", 10),
        role: "buyer",
        avatarURL: "https://i.pravatar.cc/150?img=4",
        isEmailVerified: true,
        isActive: true,
        addresses: [
          {
            fullName: "Alice Buyer",
            phone: "0903456789",
            street: "789 Buyer Road",
            city: "Da Nang",
            state: "DN",
            country: "Vietnam",
            zipCode: "550000",
            isDefault: true,
          },
        ],
      },
      {
        username: "buyer2",
        email: "buyer2@ebay.com",
        password: await bcrypt.hash("buyer123", 10),
        role: "buyer",
        avatarURL: "https://i.pravatar.cc/150?img=5",
        isEmailVerified: true,
        isActive: true,
        addresses: [
          {
            fullName: "Bob Buyer",
            phone: "0904567890",
            street: "321 Buyer Lane",
            city: "Can Tho",
            state: "CT",
            country: "Vietnam",
            zipCode: "900000",
            isDefault: true,
          },
        ],
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
    const categories = [
      {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        slug: "electronics",
      },
      {
        name: "Fashion",
        description: "Clothing, shoes, and accessories",
        slug: "fashion",
      },
      {
        name: "Home & Garden",
        description: "Home decor and garden supplies",
        slug: "home-garden",
      },
      {
        name: "Sports & Outdoors",
        description: "Sports equipment and outdoor gear",
        slug: "sports-outdoors",
      },
      {
        name: "Books & Media",
        description: "Books, movies, and music",
        slug: "books-media",
      },
      {
        name: "Toys & Games",
        description: "Toys and gaming products",
        slug: "toys-games",
      },
      {
        name: "Beauty & Health",
        description: "Beauty and health products",
        slug: "beauty-health",
      },
      {
        name: "Automotive",
        description: "Auto parts and accessories",
        slug: "automotive",
      },
      {
        name: "Food & Beverages",
        description: "Food and drink items",
        slug: "food-beverages",
      },
      {
        name: "Jewelry",
        description: "Jewelry and watches",
        slug: "jewelry",
      },
    ];

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
    const stores = [
      {
        sellerId: sellers[0]._id,
        storeName: "Tech Paradise",
        description: "Your one-stop shop for all tech gadgets",
        bannerImageURL: "https://picsum.photos/1200/300?random=1",
        logo: "https://picsum.photos/200/200?random=1",
        rating: 4.5,
        totalReviews: 120,
        totalSales: 350,
        totalProducts: 25,
        isVerified: true,
        isActive: true,
        slug: "tech-paradise",
      },
      {
        sellerId: sellers[1]._id,
        storeName: "Fashion Hub",
        description: "Latest fashion trends and styles",
        bannerImageURL: "https://picsum.photos/1200/300?random=2",
        logo: "https://picsum.photos/200/200?random=2",
        rating: 4.8,
        totalReviews: 200,
        totalSales: 500,
        totalProducts: 40,
        isVerified: true,
        isActive: true,
        slug: "fashion-hub",
      },
    ];

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
    const products = [
      {
        title: "iPhone 15 Pro Max",
        description: "Latest iPhone with A17 Pro chip, titanium design",
        price: 1299,
        quantity: 25,
        images:
          "https://picsum.photos/400/400?random=10,https://picsum.photos/400/400?random=11",
        categoryId: categories[0]._id,
        sellerId: sellers[0]._id,
        condition: "new",
        brand: "Apple",
        rating: 4.8,
        numReviews: 150,
        views: 5000,
        sold: 50,
        isActive: true,
        isFeatured: true,
        tags: ["smartphone", "apple", "iphone", "5g"],
      },
      {
        title: "Samsung Galaxy S24 Ultra",
        description: "Flagship Samsung phone with S Pen",
        price: 1199,
        quantity: 30,
        images:
          "https://picsum.photos/400/400?random=12,https://picsum.photos/400/400?random=13",
        categoryId: categories[0]._id,
        sellerId: sellers[0]._id,
        condition: "new",
        brand: "Samsung",
        rating: 4.7,
        numReviews: 120,
        views: 4500,
        sold: 45,
        isActive: true,
        isFeatured: true,
        tags: ["smartphone", "samsung", "android", "5g"],
      },
      {
        title: 'MacBook Pro 16" M3',
        description: "Powerful laptop for professionals",
        price: 2499,
        quantity: 15,
        images:
          "https://picsum.photos/400/400?random=14,https://picsum.photos/400/400?random=15",
        categoryId: categories[0]._id,
        sellerId: sellers[0]._id,
        condition: "new",
        brand: "Apple",
        rating: 4.9,
        numReviews: 200,
        views: 8000,
        sold: 30,
        isActive: true,
        isFeatured: true,
        tags: ["laptop", "apple", "macbook", "professional"],
      },
      {
        title: "Nike Air Max 2024",
        description: "Comfortable running shoes",
        price: 129,
        quantity: 50,
        images:
          "https://picsum.photos/400/400?random=20,https://picsum.photos/400/400?random=21",
        categoryId: categories[1]._id,
        sellerId: sellers[1]._id,
        condition: "new",
        brand: "Nike",
        rating: 4.6,
        numReviews: 80,
        views: 3000,
        sold: 100,
        isActive: true,
        isFeatured: false,
        tags: ["shoes", "nike", "running", "sports"],
      },
      {
        title: "Adidas Ultraboost",
        description: "Premium running shoes with boost technology",
        price: 149,
        quantity: 40,
        images:
          "https://picsum.photos/400/400?random=22,https://picsum.photos/400/400?random=23",
        categoryId: categories[1]._id,
        sellerId: sellers[1]._id,
        condition: "new",
        brand: "Adidas",
        rating: 4.7,
        numReviews: 95,
        views: 3500,
        sold: 85,
        isActive: true,
        isFeatured: false,
        tags: ["shoes", "adidas", "running", "boost"],
      },
      {
        title: "Sony WH-1000XM5 Headphones",
        description: "Industry-leading noise cancelling headphones",
        price: 399,
        quantity: 20,
        images:
          "https://picsum.photos/400/400?random=30,https://picsum.photos/400/400?random=31",
        categoryId: categories[0]._id,
        sellerId: sellers[0]._id,
        condition: "new",
        brand: "Sony",
        rating: 4.8,
        numReviews: 180,
        views: 6000,
        sold: 70,
        isActive: true,
        isFeatured: true,
        tags: ["headphones", "sony", "audio", "noise-cancelling"],
      },
      {
        title: "Vintage Camera Canon AE-1",
        description: "Classic film camera from the 80s - Perfect condition",
        price: 450,
        quantity: 1,
        images:
          "https://picsum.photos/400/400?random=40,https://picsum.photos/400/400?random=41",
        categoryId: categories[0]._id,
        sellerId: sellers[0]._id,
        condition: "used",
        brand: "Canon",
        rating: 4.5,
        numReviews: 25,
        views: 1200,
        sold: 5,
        isActive: true,
        isAuction: true,
        auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ["camera", "vintage", "film", "canon", "auction"],
      },
      {
        title: "Rolex Submariner (Replica)",
        description: "High-quality replica watch - Auction item",
        price: 200,
        quantity: 3,
        images:
          "https://picsum.photos/400/400?random=50,https://picsum.photos/400/400?random=51",
        categoryId: categories[9]._id,
        sellerId: sellers[1]._id,
        condition: "new",
        brand: "Rolex",
        rating: 4.2,
        numReviews: 15,
        views: 2500,
        sold: 0,
        isActive: true,
        isAuction: true,
        auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        tags: ["watch", "rolex", "auction", "luxury"],
      },
    ];

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
    const inventory = products.map((product) => ({
      productId: product._id,
      quantity: Math.floor(Math.random() * 100) + 10,
      lowStockThreshold: 10,
      reorderQuantity: 50,
    }));

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
    const coupons = [
      {
        code: "WELCOME10",
        description: "Welcome discount for new customers",
        discountPercent: 10,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxUsage: 100,
        usedCount: 0,
        minPurchaseAmount: 50,
        isActive: true,
      },
      {
        code: "FLASH20",
        description: "Flash sale - 20% off",
        discountPercent: 20,
        discountType: "percentage",
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUsage: 50,
        usedCount: 15,
        minPurchaseAmount: 100,
        maxDiscountAmount: 50,
        isActive: true,
      },
      {
        code: "SAVE50",
        description: "Save $50 on orders over $500",
        discountType: "fixed",
        discountValue: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxUsage: 30,
        usedCount: 5,
        minPurchaseAmount: 500,
        seller: sellers[0]._id,
        isActive: true,
      },
    ];

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
    const reviews = [
      {
        product: products[0]._id,
        user: buyers[0]._id,
        rating: 5,
        title: "Amazing phone!",
        comment:
          "Best iPhone ever, love the titanium design and camera quality.",
        isVerified: true,
        helpfulCount: 25,
      },
      {
        product: products[0]._id,
        user: buyers[1]._id,
        rating: 4,
        title: "Great but expensive",
        comment: "Excellent phone but the price is quite high.",
        isVerified: true,
        helpfulCount: 15,
      },
      {
        product: products[2]._id,
        user: buyers[0]._id,
        rating: 5,
        title: "Perfect for work",
        comment: "M3 chip is incredibly fast. Battery life is amazing!",
        isVerified: true,
        helpfulCount: 30,
      },
    ];

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
    const auctionProducts = products.filter((p) => p.isAuction);

    if (auctionProducts.length > 0) {
      const bids = [
        {
          productId: auctionProducts[0]._id,
          bidderId: buyers[0]._id,
          amount: 480,
          status: "outbid",
        },
        {
          productId: auctionProducts[0]._id,
          bidderId: buyers[1]._id,
          amount: 500,
          status: "active",
          isWinning: true,
        },
      ];

      if (auctionProducts.length > 1) {
        bids.push(
          {
            productId: auctionProducts[1]._id,
            bidderId: buyers[0]._id,
            amount: 220,
            status: "outbid",
          },
          {
            productId: auctionProducts[1]._id,
            bidderId: buyers[1]._id,
            amount: 250,
            status: "active",
            isWinning: true,
          }
        );
      }

      await Bid.insertMany(bids);
      console.log("✅ Bids seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding bids:", error);
    throw error;
  }
};

// Seed Feedback for sellers
const seedFeedback = async (sellers) => {
  try {
    const feedback = [
      {
        sellerId: sellers[0]._id,
        averageRating: 4.5,
        totalReviews: 120,
        positiveRate: 92,
        ratingDistribution: {
          fiveStar: 80,
          fourStar: 30,
          threeStar: 5,
          twoStar: 3,
          oneStar: 2,
        },
        totalSales: 350,
        responseRate: 95,
        responseTime: 2,
        onTimeDeliveryRate: 98,
      },
      {
        sellerId: sellers[1]._id,
        averageRating: 4.8,
        totalReviews: 200,
        positiveRate: 96,
        ratingDistribution: {
          fiveStar: 160,
          fourStar: 32,
          threeStar: 5,
          twoStar: 2,
          oneStar: 1,
        },
        totalSales: 500,
        responseRate: 98,
        responseTime: 1.5,
        onTimeDeliveryRate: 99,
      },
    ];

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
    // Ensure we have products with populated seller info
    const populatedProducts = await Product.find({ _id: { $in: products.slice(0, 6).map(p => p._id) } }).populate('sellerId');
    
    const orders = [
      {
        buyerId: buyers[0]._id,
        orderDate: new Date(),
        totalPrice: populatedProducts[0].price + 10 + (populatedProducts[0].price * 0.1),
        status: "pending",
        items: [
          {
            product: populatedProducts[0]._id,
            name: populatedProducts[0].title,
            quantity: 1,
            price: populatedProducts[0].price,
            image: populatedProducts[0].images[0] || "default.jpg",
            seller: populatedProducts[0].sellerId._id,
          },
        ],
        paymentMethod: "paypal",
        paymentStatus: "pending",
        shippingAddress: {
          fullName: buyers[0].fullName,
          phone: "0909999999",
          street: "456 Buyer Street",
          city: "Ha Noi",
          state: "HN",
          country: "Vietnam",
          zipCode: "100000",
        },
        itemsPrice: populatedProducts[0].price,
        shippingPrice: 10,
        taxPrice: populatedProducts[0].price * 0.1,
      },
      {
        buyerId: buyers[1]._id,
        orderDate: new Date(Date.now() - 86400000), // 1 day ago
        totalPrice: populatedProducts[2].price + 15 + (populatedProducts[2].price * 0.1),
        status: "processing",
        items: [
          {
            product: populatedProducts[2]._id,
            name: populatedProducts[2].title,
            quantity: 1,
            price: populatedProducts[2].price,
            image: populatedProducts[2].images[0] || "default.jpg",
            seller: populatedProducts[2].sellerId._id,
          },
        ],
        paymentMethod: "stripe",
        paymentStatus: "paid",
        paymentInfo: {
          id: "PAY_" + Date.now(),
          paidAt: new Date(Date.now() - 86400000),
        },
        shippingAddress: {
          fullName: buyers[1].fullName,
          phone: "0908888888",
          street: "789 Buyer Avenue",
          city: "Da Nang",
          state: "DN",
          country: "Vietnam",
          zipCode: "550000",
        },
        itemsPrice: populatedProducts[2].price,
        shippingPrice: 15,
        taxPrice: populatedProducts[2].price * 0.1,
      },
      {
        buyerId: buyers[0]._id,
        orderDate: new Date(Date.now() - 172800000), // 2 days ago
        totalPrice: (populatedProducts[3].price * 2) + 5 + (populatedProducts[3].price * 2 * 0.1),
        status: "shipped",
        items: [
          {
            product: populatedProducts[3]._id,
            name: populatedProducts[3].title,
            quantity: 2,
            price: populatedProducts[3].price,
            image: populatedProducts[3].images[0] || "default.jpg",
            seller: populatedProducts[3].sellerId._id,
          },
        ],
        paymentMethod: "cod",
        paymentStatus: "pending",
        trackingNumber: "TRACK123456",
        carrier: "ViettelPost",
        estimatedArrival: new Date(Date.now() + 172800000), // 2 days from now
        shippingAddress: {
          fullName: buyers[0].fullName,
          phone: "0909999999",
          street: "456 Buyer Street",
          city: "Ha Noi",
          state: "HN",
          country: "Vietnam",
          zipCode: "100000",
        },
        itemsPrice: populatedProducts[3].price * 2,
        shippingPrice: 5,
        taxPrice: populatedProducts[3].price * 2 * 0.1,
      },
      {
        buyerId: buyers[1]._id,
        orderDate: new Date(Date.now() - 259200000), // 3 days ago
        totalPrice: populatedProducts[5].price + 10 + (populatedProducts[5].price * 0.1),
        status: "delivered",
        items: [
          {
            product: populatedProducts[5]._id,
            name: populatedProducts[5].title,
            quantity: 1,
            price: populatedProducts[5].price,
            image: populatedProducts[5].images[0] || "default.jpg",
            seller: populatedProducts[5].sellerId._id,
          },
        ],
        paymentMethod: "bank_transfer",
        paymentStatus: "paid",
        paymentInfo: {
          id: "BANK_" + Date.now(),
          paidAt: new Date(Date.now() - 259200000),
        },
        deliveredAt: new Date(Date.now() - 172800000), // 2 days ago
        shippingAddress: {
          fullName: buyers[1].fullName,
          phone: "0908888888",
          street: "789 Buyer Avenue",
          city: "Da Nang",
          state: "DN",
          country: "Vietnam",
          zipCode: "550000",
        },
        itemsPrice: populatedProducts[5].price,
        shippingPrice: 10,
        taxPrice: populatedProducts[5].price * 0.1,
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 259200000),
            note: "Order placed",
          },
          {
            status: "processing",
            timestamp: new Date(Date.now() - 216000000),
            note: "Payment confirmed",
          },
          {
            status: "shipped",
            timestamp: new Date(Date.now() - 172800000),
            note: "Order shipped",
          },
          {
            status: "delivered",
            timestamp: new Date(Date.now() - 172800000),
            note: "Order delivered successfully",
          },
        ],
      },
    ];

    // Create orders one by one to ensure unique orderNumbers
    const createdOrders = [];
    for (const orderData of orders) {
      const order = await Order.create(orderData);
      createdOrders.push(order);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
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
    console.log(`   - Coupons: 3`);
    console.log(`   - Reviews: 3`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Feedback records: 2`);

    console.log("\n👥 Test Accounts:");
    console.log("   Admin: admin@ebay.com / admin123");
    console.log("   Seller 1: seller1@ebay.com / seller123");
    console.log("   Seller 2: seller2@ebay.com / seller123");
    console.log("   Buyer 1: buyer1@ebay.com / buyer123");
    console.log("   Buyer 2: buyer2@ebay.com / buyer123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
