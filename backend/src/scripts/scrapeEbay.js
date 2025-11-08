const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Product = require("../models/Product");
const User = require("../models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Scrape eBay products (simplified version for educational purposes)
const scrapeEbayProducts = async () => {
  try {
    console.log("🔍 Scraping eBay products...");

    // Since direct scraping might be blocked, we'll create sample products based on eBay-like data
    const sampleProducts = [
      {
        title:
          'Dell Latitude 5420 14" Laptop Intel Core i5-1145G7 2.6GHz 16GB RAM 256GB SSD',
        description:
          "Professional business laptop with powerful Intel Core i5 processor, 16GB RAM, and fast 256GB SSD. Perfect for multitasking and productivity. Comes with Windows 11 Pro pre-installed. Excellent condition with minor wear.",
        price: 549.99,
        condition: "used",
        brand: "Dell",
        category: "Laptops & Netbooks",
        images:
          "https://i.ebayimg.com/images/g/placeholder1.jpg,https://i.ebayimg.com/images/g/placeholder2.jpg",
        quantity: 5,
        tags: ["laptop", "dell", "intel", "business", "windows 11"],
      },
      {
        title:
          'HP EliteBook 840 G8 14" Touchscreen Laptop Intel i7 16GB RAM 512GB SSD',
        description:
          "Premium business ultrabook with touchscreen display, Intel Core i7-1165G7, 16GB DDR4 RAM, and 512GB NVMe SSD. Features backlit keyboard, fingerprint reader, and Windows 11 Pro. Like new condition.",
        price: 899.99,
        condition: "used",
        brand: "HP",
        category: "Laptops & Netbooks",
        images:
          "https://i.ebayimg.com/images/g/hp-placeholder1.jpg,https://i.ebayimg.com/images/g/hp-placeholder2.jpg",
        quantity: 3,
        tags: ["laptop", "hp", "touchscreen", "intel i7", "business"],
      },
      {
        title:
          'Lenovo ThinkPad X1 Carbon Gen 9 14" Laptop Intel i5 8GB RAM 256GB SSD',
        description:
          "Ultralight business laptop weighing only 2.49 lbs. Intel Core i5-1135G7, 8GB RAM, 256GB SSD. Full HD display, excellent keyboard, and long battery life. Perfect for professionals on the go.",
        price: 749.99,
        condition: "used",
        brand: "Lenovo",
        category: "Laptops & Netbooks",
        images: "https://i.ebayimg.com/images/g/lenovo-placeholder1.jpg",
        quantity: 8,
        tags: ["laptop", "lenovo", "thinkpad", "ultralight", "business"],
      },
      {
        title:
          'Apple MacBook Air 13.3" M1 Chip 8GB RAM 256GB SSD - Space Gray (2020)',
        description:
          "Revolutionary M1 chip delivers incredible performance and battery life. 8GB unified memory, 256GB SSD storage. Stunning Retina display, Touch ID, and macOS. Excellent condition with original box.",
        price: 849.99,
        condition: "used",
        brand: "Apple",
        category: "Laptops & Netbooks",
        images:
          "https://i.ebayimg.com/images/g/apple-placeholder1.jpg,https://i.ebayimg.com/images/g/apple-placeholder2.jpg",
        quantity: 4,
        tags: ["macbook", "apple", "m1", "retina", "macos"],
      },
      {
        title:
          'ASUS ROG Strix G15 Gaming Laptop 15.6" AMD Ryzen 7 16GB RAM 512GB SSD RTX 3060',
        description:
          "Powerful gaming laptop with AMD Ryzen 7 5800H, NVIDIA GeForce RTX 3060 6GB, 16GB DDR4 RAM, 512GB NVMe SSD. 144Hz Full HD display, RGB keyboard, and Windows 11. Perfect for gaming and content creation.",
        price: 1199.99,
        condition: "used",
        brand: "ASUS",
        category: "PC Laptops & Netbooks",
        images: "https://i.ebayimg.com/images/g/asus-placeholder1.jpg",
        quantity: 2,
        tags: ["gaming", "laptop", "asus", "rtx 3060", "ryzen 7"],
      },
      {
        title:
          'Microsoft Surface Laptop 4 13.5" Touchscreen Intel i5 8GB RAM 512GB SSD Platinum',
        description:
          'Sleek and stylish laptop with beautiful 13.5" PixelSense touchscreen, Intel Core i5-1135G7, 8GB RAM, 512GB SSD. Features Alcantara keyboard, Windows 11, and all-day battery life. Like new condition.',
        price: 799.99,
        condition: "used",
        brand: "Microsoft",
        category: "Laptops & Netbooks",
        images:
          "https://i.ebayimg.com/images/g/surface-placeholder1.jpg,https://i.ebayimg.com/images/g/surface-placeholder2.jpg",
        quantity: 6,
        tags: ["laptop", "microsoft", "surface", "touchscreen", "premium"],
      },
    ];

    // Find a seller to assign these products to
    const seller = await User.findOne({ role: "seller" });
    if (!seller) {
      console.log("❌ No seller found. Please run seed script first.");
      return;
    }

    console.log(`📦 Creating ${sampleProducts.length} products...`);

    for (const productData of sampleProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({
        title: productData.title,
      });
      if (existingProduct) {
        console.log(`⚠️  Product already exists: ${productData.title}`);
        continue;
      }

      const product = new Product({
        ...productData,
        sellerId: seller._id,
        status: "active",
        isAuction: false,
        views: Math.floor(Math.random() * 100) + 10,
        sold: Math.floor(Math.random() * 20),
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        numReviews: Math.floor(Math.random() * 50),
      });

      await product.save();
      console.log(`✅ Created: ${product.title}`);
    }

    console.log("🎉 Successfully scraped and created products!");
  } catch (error) {
    console.error("❌ Error scraping products:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await scrapeEbayProducts();
  await mongoose.connection.close();
  console.log("👋 Database connection closed");
  process.exit(0);
};

main();
