import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
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
