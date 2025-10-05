import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 4));
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProducts.length]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products?limit=12&sort=-views");
      if (response.data.success) {
        setFeaturedProducts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching featured products:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 4));
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredProducts.length / 4)) % Math.ceil(featuredProducts.length / 4));
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  const getVisibleProducts = () => {
    const productsPerSlide = 4;
    const start = currentSlide * productsPerSlide;
    return featuredProducts.slice(start, start + productsPerSlide);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Welcome to eBay Clone</h1>
            <p className="text-xl mb-8">
              Discover amazing products from trusted sellers worldwide
            </p>
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-3 inline-block"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No products available
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredProducts.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {featuredProducts.slice(slideIndex * 4, slideIndex * 4 + 4).map((product) => {
                        const images = product.images ? product.images.split(",") : [];
                        const firstImage = images[0] || "";
                        
                        return (
                          <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <div className="aspect-square bg-gray-200 mb-4 rounded-lg overflow-hidden">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                              {product.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-bold text-blue-600">
                                ${product.price?.toFixed(2)}
                              </p>
                              {product.quantity !== undefined && (
                                <span className={`text-sm ${
                                  product.quantity === 0 
                                    ? "text-red-600 font-semibold" 
                                    : product.quantity < 10 
                                    ? "text-orange-600" 
                                    : "text-green-600"
                                }`}>
                                  {product.quantity === 0 ? "Out of Stock" : `${product.quantity} left`}
                                </span>
                              )}
                            </div>
                            {product.rating > 0 && (
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <span className="text-yellow-500">⭐</span>
                                <span className="ml-1">{product.rating.toFixed(1)}</span>
                                <span className="ml-1">({product.numReviews})</span>
                              </div>
                            )}
                            <div className="mt-2 text-sm text-gray-500">
                              👁️ {product.views} views • 🛒 {product.sold} sold
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {featuredProducts.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all z-10"
                    aria-label="Previous slide"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all z-10"
                    aria-label="Next slide"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {featuredProducts.length > 4 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(featuredProducts.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === index 
                          ? "w-8 bg-blue-600" 
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* View All Button */}
              <div className="text-center mt-8">
                <Link
                  to="/products"
                  className="btn-primary inline-block"
                >
                  View All Products →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Browse thousands of products across multiple categories
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure Shopping</h3>
              <p className="text-gray-600">
                Your transactions and data are always protected
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">
                Get your orders delivered quickly and safely
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Electronics", "Fashion", "Home & Garden", "Sports", "Books"].map(
              (category) => (
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="card hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-2">📦</div>
                  <h3 className="font-semibold">{category}</h3>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
