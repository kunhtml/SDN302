import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  ShoppingCart,
  TrendUp,
  Package,
  Lock,
  Truck,
  ArrowRight,
  Star,
  Laptop,
  TShirt,
  House,
  Barbell,
  Book,
  GameController,
  FirstAidKit,
  Heart,
  Sparkle,
  Fire,
  EnvelopeSimple,
  ShieldCheck,
} from "phosphor-react";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    {
      name: "Electronics",
      icon: Laptop,
      color: "from-blue-500 to-blue-600",
      count: "1.2k+",
    },
    {
      name: "Fashion",
      icon: TShirt,
      color: "from-pink-500 to-pink-600",
      count: "3.5k+",
    },
    {
      name: "Home & Garden",
      icon: House,
      color: "from-green-500 to-green-600",
      count: "890+",
    },
    {
      name: "Sports",
      icon: Barbell,
      color: "from-orange-500 to-orange-600",
      count: "650+",
    },
    {
      name: "Books",
      icon: Book,
      color: "from-purple-500 to-purple-600",
      count: "2.1k+",
    },
    {
      name: "Toys",
      icon: GameController,
      color: "from-red-500 to-red-600",
      count: "1.8k+",
    },
    {
      name: "Health",
      icon: FirstAidKit,
      color: "from-teal-500 to-teal-600",
      count: "420+",
    },
    {
      name: "Beauty",
      icon: Heart,
      color: "from-rose-500 to-rose-600",
      count: "980+",
    },
  ]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [trendingRes, newRes] = await Promise.all([
        api.get("/products?limit=8&sort=-views"),
        api.get("/products?limit=8&sort=-createdAt"),
      ]);

      if (trendingRes.data.success) {
        setTrendingProducts(trendingRes.data.data);
      }
      if (newRes.data.success) {
        setNewProducts(newRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product) => {
    const images = product.images ? product.images.split(",") : [];
    const firstImage = images[0] || "";

    return (
      <Link
        key={product._id}
        to={`/products/${product._id}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
      >
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package size={64} weight="thin" />
            </div>
          )}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          {product.quantity > 0 && product.quantity < 10 && (
            <div className="absolute top-3 left-3">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Only {product.quantity} left
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-2xl font-bold text-blue-600">
              ${product.price?.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={16} weight="fill" className="text-yellow-400" />
                <span className="font-medium text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
                <span>({product.numReviews})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} weight="duotone" />
              <span>{product.sold || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit">
                  <Sparkle size={18} weight="fill" />
                  Welcome to the Future of Shopping
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Products & Deals
                </span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Shop from millions of products with the best prices and fastest
                delivery. Your satisfaction is our priority.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Start Shopping
                  <ArrowRight size={20} weight="bold" />
                </Link>
                <button className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm border-2 border-white text-white rounded-full font-semibold hover:bg-opacity-20 transition-all duration-300">
                  Learn More
                </button>
              </div>
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-blue-200 text-sm">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5K+</div>
                  <div className="text-blue-200 text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-blue-200 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm"
                      >
                        <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl h-24 mb-2"></div>
                        <div className="h-2 bg-white bg-opacity-40 rounded mb-2"></div>
                        <div className="h-2 bg-white bg-opacity-30 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Explore our wide range of product categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/products?category=${category.name}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="mb-3 text-blue-600 flex justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent size={48} weight="duotone" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">{category.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Fire size={40} weight="fill" className="text-orange-500" />
                Trending Now
              </h2>
              <p className="text-gray-600">Most popular products this week</p>
            </div>
            <Link
              to="/products?sort=-views"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
            >
              View All
              <ArrowRight
                size={20}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-square mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 8).map(renderProductCard)}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/products?sort=-views"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Trending Products
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Sparkle size={40} weight="fill" className="text-purple-500" />
                New Arrivals
              </h2>
              <p className="text-gray-600">
                Fresh products just added to our store
              </p>
            </div>
            <Link
              to="/products?sort=-createdAt"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
            >
              View All
              <ArrowRight
                size={20}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-square mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.slice(0, 8).map(renderProductCard)}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/products?sort=-createdAt"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              View All New Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-blue-100 text-lg">
              We provide the best shopping experience for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-white bg-opacity-20 rounded-2xl mb-6">
                <ShoppingCart
                  size={48}
                  weight="duotone"
                  className="text-white"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Wide Selection</h3>
              <p className="text-blue-100 leading-relaxed">
                Millions of products across all categories. Find exactly what
                you're looking for.
              </p>
            </div>
            <div className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-white bg-opacity-20 rounded-2xl mb-6">
                <ShieldCheck
                  size={48}
                  weight="duotone"
                  className="text-white"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure Payment</h3>
              <p className="text-blue-100 leading-relaxed">
                100% secure transactions with SSL encryption. Your data is
                always protected.
              </p>
            </div>
            <div className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-white bg-opacity-20 rounded-2xl mb-6">
                <Truck size={48} weight="duotone" className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-blue-100 leading-relaxed">
                Quick and reliable shipping worldwide. Track your order in
                real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 text-white shadow-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Get the latest deals, new arrivals, and exclusive offers
                delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                />
                <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Subscribe Now
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-4">
                <ShieldCheck size={16} weight="fill" className="inline mr-1" />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
