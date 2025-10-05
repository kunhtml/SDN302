import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

// Products page with full functionality
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching products with params:",
        Object.fromEntries(searchParams)
      );

      const response = await api.get("/products", {
        params: Object.fromEntries(searchParams),
      });

      console.log("Products response:", response.data);

      if (response.data.success) {
        setProducts(response.data.data || []);
        setPagination({
          page: response.data.page,
          pages: response.data.pages,
          total: response.data.total,
        });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        newParams.set(key, filters[key]);
      }
    });
    setSearchParams(newParams);
  };

  const handleSortChange = (value) => {
    const newFilters = { ...filters, sort: value };
    setFilters(newFilters);

    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", value);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={handleKeyPress}
            className="input"
          />
          <select
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            onKeyPress={handleKeyPress}
            className="input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            onKeyPress={handleKeyPress}
            className="input"
          />
          <button onClick={applyFilters} className="btn-primary">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {products.length} of {pagination.total} products
        </p>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No products found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                ${product.price?.toFixed(2)}
              </p>
              {product.rating && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-1">⭐</span>
                  <span>{product.rating.toFixed(1)}</span>
                  {product.reviewCount && (
                    <span className="ml-1">({product.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.images) {
      const images = product.images.split(",");
      setSelectedImage(images[0] || "");
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching product:", id);

      const response = await api.get(`/products/${id}`);

      console.log("Product response:", response.data);

      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images ? product.images.split(",") : [];

  return (
    <div className="container-custom py-8">
      <button
        onClick={() => navigate("/products")}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === img
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {product.rating && (
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500 mr-2">
                {"⭐".repeat(Math.round(product.rating))}
              </div>
              <span className="text-gray-600">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>
          )}

          <div className="mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              ${product.price?.toFixed(2)}
            </div>
            {product.isAuction && (
              <div className="text-sm text-gray-600">
                Auction ends:{" "}
                {new Date(product.auctionEndTime).toLocaleString()}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Condition:</span>
                <span className="ml-2 font-semibold capitalize">
                  {product.condition}
                </span>
              </div>
              {product.brand && (
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-semibold">{product.brand}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Views:</span>
                <span className="ml-2 font-semibold">{product.views}</span>
              </div>
              <div>
                <span className="text-gray-600">Sold:</span>
                <span className="ml-2 font-semibold">{product.sold}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!product.isAuction && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity || 999}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxStock = product.quantity || 999;
                    const validQuantity = Math.min(
                      Math.max(1, value),
                      maxStock
                    );
                    setQuantity(validQuantity);
                  }}
                  onBlur={(e) => {
                    // Auto-correct on blur if user manually typed invalid value
                    const value = parseInt(e.target.value) || 1;
                    const maxStock = product.quantity || 999;
                    const validQuantity = Math.min(
                      Math.max(1, value),
                      maxStock
                    );
                    if (value !== validQuantity) {
                      setQuantity(validQuantity);
                    }
                  }}
                  className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, product.quantity || 999))
                  }
                  disabled={quantity >= (product.quantity || 999)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {product.quantity ? (
                  <span
                    className={
                      product.quantity < 10 ? "text-red-600 font-semibold" : ""
                    }
                  >
                    {product.quantity}{" "}
                    {product.quantity === 1 ? "item" : "items"} available
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Stock information unavailable
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {product.isAuction ? (
              <button className="btn-primary flex-1">Place Bid</button>
            ) : (
              <>
                <button className="btn-primary flex-1">Add to Cart</button>
                <button className="btn-secondary">Buy Now</button>
              </>
            )}
          </div>

          {product.sellerId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Seller Information</h3>
              <div className="flex items-center gap-3">
                {product.sellerId.avatarURL && (
                  <img
                    src={product.sellerId.avatarURL}
                    alt={product.sellerId.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{product.sellerId.username}</p>
                  <p className="text-sm text-gray-600">
                    {product.sellerId.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const Cart = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Cart Page</h1>
  </div>
);
const Checkout = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Checkout Page</h1>
  </div>
);
const Orders = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Orders Page</h1>
  </div>
);
const OrderDetail = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Order Detail Page</h1>
  </div>
);
const Profile = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Profile Page</h1>
  </div>
);
const Chat = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Chat Page</h1>
  </div>
);

// Seller Pages
const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch seller's products (show all recent products)
      const productsRes = await api.get("/products", {
        params: { sellerId: user?._id, limit: 100 },
      });

      if (productsRes.data.success) {
        setRecentProducts(productsRes.data.data || []);
        setStats((prev) => ({
          ...prev,
          totalProducts: productsRes.data.total || 0,
        }));
      }

      // Fetch seller's orders
      const ordersRes = await api.get("/orders/seller/orders");

      if (ordersRes.data.success) {
        const orders = ordersRes.data.data || [];
        const totalRevenue = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = orders.filter(
          (o) => o.status === "pending"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders,
        }));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalProducts}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalOrders}
              </p>
            </div>
            <div className="text-4xl">🛍️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Orders</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/seller/products")}
            className="btn-primary"
          >
            📦 Manage Products
          </button>
          <button
            onClick={() => navigate("/seller/orders")}
            className="btn-secondary"
          >
            🛍️ View Orders
          </button>
          <button
            onClick={() => navigate("/seller/store")}
            className="btn-secondary"
          >
            🏪 Store Settings
          </button>
          <button
            onClick={() => navigate("/seller/products/new")}
            className="btn-secondary"
          >
            ➕ Add New Product
          </button>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Products</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="text-blue-600 hover:text-blue-800"
          >
            View All →
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products yet</p>
            <button
              onClick={() => navigate("/seller/products/new")}
              className="btn-primary mt-4"
            >
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Views
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Sold
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded mr-3">
                          {product.images && (
                            <img
                              src={product.images.split(",")[0]}
                              alt={product.title}
                              className="h-full w-full object-cover rounded"
                            />
                          )}
                        </div>
                        <span className="font-medium">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ${product.price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          product.quantity === 0
                            ? "text-red-600"
                            : product.quantity < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.quantity || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.views || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.sold || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {recentProducts.slice(0, 3).map((product, idx) => (
              <div
                key={product._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                  </span>
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-gray-600">
                      {product.sold || 0} sold
                    </p>
                  </div>
                </div>
                <span className="font-bold text-blue-600">
                  ${product.price}
                </span>
              </div>
            ))}
            {recentProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Store Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Product Views</span>
                <span className="text-sm font-semibold">
                  {recentProducts.reduce((sum, p) => sum + (p.views || 0), 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-semibold">12.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "12.5%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <span className="text-sm font-semibold">4.8/5.0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "96%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products", {
        params: { sellerId: user?._id },
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      alert("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.put(`/products/${productId}`, {
        isActive: !currentStatus,
      });

      setProducts(
        products.map((p) =>
          p._id === productId ? { ...p, isActive: !currentStatus } : p
        )
      );
    } catch (err) {
      console.error("Error updating product:", err);
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <button
          onClick={() => navigate("/seller/products/new")}
          className="btn-primary"
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Stock</p>
          <p className="text-2xl font-bold text-indigo-600">
            {products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Views</p>
          <p className="text-2xl font-bold text-purple-600">
            {products.reduce((sum, p) => sum + (p.views || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Sold</p>
          <p className="text-2xl font-bold text-orange-600">
            {products.reduce((sum, p) => sum + (p.sold || 0), 0)}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first product
            </p>
            <button
              onClick={() => navigate("/seller/products/new")}
              className="btn-primary"
            >
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded">
                          {product.images && (
                            <img
                              src={product.images.split(",")[0]}
                              alt={product.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categoryId?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${product.price?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          product.quantity === 0
                            ? "text-red-600"
                            : product.quantity < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.quantity || 0} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sold || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleActive(product._id, product.isActive)
                        }
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/seller/products/edit/${product._id}`)
                        }
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/seller/orders", {
        params: filter !== "all" ? { status: filter } : {},
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-gray-600">Manage your customer orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: "all", label: "All Orders", count: stats.all },
            { key: "pending", label: "Pending", count: stats.pending },
            { key: "processing", label: "Processing", count: stats.processing },
            { key: "shipped", label: "Shipped", count: stats.shipped },
            { key: "delivered", label: "Delivered", count: stats.delivered },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                filter === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600">
              Orders will appear here when customers buy your products
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="border-t border-b py-4 mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-600 mr-2">Customer:</span>
                  <span className="font-medium">{order.buyer.username}</span>
                  <span className="text-gray-500 ml-2">
                    ({order.buyer.email})
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Products:</p>
                  {order.products.map((product, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {product.title} x {product.quantity}
                      </span>
                      <span className="font-medium">
                        ${(product.price * product.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">
                  Total: ${order.totalAmount.toFixed(2)}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                    className="btn-secondary"
                  >
                    View Details
                  </button>
                  {order.status === "pending" && (
                    <button className="btn-primary">Process Order</button>
                  )}
                  {order.status === "processing" && (
                    <button className="btn-primary">Mark as Shipped</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
const SellerStore = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    logo: "",
    banner: "",
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stores/my-store");

      if (response.data.success) {
        const storeData = response.data.data;
        setStore(storeData);
        setFormData({
          name: storeData.name || "",
          description: storeData.description || "",
          phone: storeData.phone || "",
          email: storeData.email || "",
          address: storeData.address || "",
          city: storeData.city || "",
          country: storeData.country || "Vietnam",
          logo: storeData.logo || "",
          banner: storeData.banner || "",
        });
      }
    } catch (err) {
      console.error("Error fetching store:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put("/stores", formData);

      if (response.data.success) {
        setStore(response.data.data);
        setEditing(false);
        alert("Store updated successfully!");
      }
    } catch (err) {
      console.error("Error updating store:", err);
      alert(err.response?.data?.message || "Failed to update store");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Store Settings</h1>
          <p className="text-gray-600">
            Manage your store information and settings
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary">
            ✏️ Edit Store
          </button>
        )}
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Store Rating</p>
              <p className="text-3xl font-bold text-yellow-600">
                ⭐ {store?.rating}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-green-600">
                {store?.totalSales}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Date(store?.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gray-200 relative">
          {store?.banner && (
            <img
              src={store.banner}
              alt="Store banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-end">
              <div className="h-24 w-24 bg-white rounded-lg border-4 border-white shadow-lg overflow-hidden">
                {store?.logo && (
                  <img
                    src={store.logo}
                    alt="Store logo"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="ml-4 mb-2">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {store?.name}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="input w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner URL
                  </label>
                  <input
                    type="url"
                    name="banner"
                    value={formData.banner}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: store.name,
                      description: store.description,
                      phone: store.phone,
                      email: store.email,
                      address: store.address,
                      city: store.city,
                      country: store.country,
                      logo: store.logo,
                      banner: store.banner,
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <p className="text-gray-900">{store?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Contact Email
                  </h3>
                  <p className="text-gray-900">{store?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Phone
                  </h3>
                  <p className="text-gray-900">{store?.phone}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Address
                  </h3>
                  <p className="text-gray-900">{store?.address}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    City
                  </h3>
                  <p className="text-gray-900">
                    {store?.city}, {store?.country}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-bold mb-4">Additional Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Vacation Mode</h4>
              <p className="text-sm text-gray-600">
                Temporarily pause all listings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive updates about orders and messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Auto-Reply Messages</h4>
              <p className="text-sm text-gray-600">
                Automatically respond to customer inquiries
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Pages
const AdminDashboard = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
  </div>
);
const AdminUsers = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Admin Users</h1>
  </div>
);
const AdminProducts = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Admin Products</h1>
  </div>
);
const AdminOrders = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Admin Orders</h1>
  </div>
);
const AdminDisputes = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Admin Disputes</h1>
  </div>
);

// AddProduct Component
const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    condition: "new",
    brand: "",
    images: "",
    tags: "",
    isAuction: false,
    auctionEndTime: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert tags from comma-separated string to array
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Remove auctionEndTime if not auction
      if (!dataToSend.isAuction) {
        delete dataToSend.auctionEndTime;
      }

      const response = await api.post("/products", dataToSend);

      if (response.data.success) {
        alert("Product created successfully!");
        navigate("/seller/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <button
            onClick={() => navigate("/seller/products")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Products
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your product in detail"
              />
            </div>

            {/* Price, Quantity and Category */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price * ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition and Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product brand"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs
                <span className="text-sm text-gray-500 ml-2">
                  (comma-separated)
                </span>
              </label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
                <span className="text-sm text-gray-500 ml-2">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="electronics, smartphone, android"
              />
            </div>

            {/* Auction */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="isAuction"
                  checked={formData.isAuction}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  This is an auction item
                </label>
              </div>

              {formData.isAuction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auction End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="auctionEndTime"
                    value={formData.auctionEndTime}
                    onChange={handleChange}
                    required={formData.isAuction}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="btn-primary">
        Go Home
      </a>
    </div>
  </div>
);

export {
  Products,
  ProductDetail,
  Cart,
  Checkout,
  Orders,
  OrderDetail,
  Profile,
  Chat,
  SellerDashboard,
  SellerProducts,
  AddProduct,
  SellerOrders,
  SellerStore,
  AdminDashboard,
  AdminUsers,
  AdminProducts,
  AdminOrders,
  AdminDisputes,
  NotFound,
};
