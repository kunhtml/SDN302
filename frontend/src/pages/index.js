import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  Link,
} from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import { toast } from "react-toastify";

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
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (product.quantity === 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAddingToCart(true);
      const response = await api.post("/cart/items", {
        productId: product._id,
        quantity: quantity,
      });

      if (response.data.success) {
        toast.success("Added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
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
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.quantity === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart
                    ? "Adding..."
                    : product.quantity === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
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
const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      });
      if (response.data.success) {
        setCart(response.data.data);
        toast.success("Cart updated");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
      const response = await api.delete(`/cart/items/${itemId}`);
      if (response.data.success) {
        setCart(response.data.data);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear all items from cart?")) return;

    try {
      setLoading(true);
      const response = await api.delete("/cart");
      if (response.data.success) {
        setCart(response.data.data);
        toast.success("Cart cleared");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(error.response?.data?.message || "Failed to clear cart");
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

  if (cart.items.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding items to your cart to see them here
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shipping = cart.subtotal > 50 ? 0 : 5.99;
  const tax = cart.subtotal * 0.1; // 10% tax
  const total = cart.subtotal + shipping + tax;

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="divide-y">
              {cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;

                const images = product.images ? product.images.split(",") : [];
                const firstImage = images[0] || "";
                const isUpdating = updatingItems[item._id];

                return (
                  <div
                    key={item._id}
                    className={`p-4 ${isUpdating ? "opacity-50" : ""}`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/products/${product._id}`}
                        className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                      >
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
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link
                          to={`/products/${product._id}`}
                          className="font-semibold text-lg hover:text-blue-600 block mb-1"
                        >
                          {product.title}
                        </Link>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="capitalize">
                            {product.condition}
                          </span>
                          {product.brand && (
                            <span> • Brand: {product.brand}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-600">
                            ${product.price?.toFixed(2)}
                          </div>
                          {product.quantity !== undefined && (
                            <div className="text-sm text-gray-600">
                              {product.quantity === 0 ? (
                                <span className="text-red-600 font-semibold">
                                  Out of Stock
                                </span>
                              ) : product.quantity < 10 ? (
                                <span className="text-orange-600">
                                  Only {product.quantity} left
                                </span>
                              ) : (
                                <span className="text-green-600">In Stock</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isUpdating}
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={product.quantity || 999}
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                const maxStock = product.quantity || 999;
                                const validQuantity = Math.min(
                                  Math.max(1, value),
                                  maxStock
                                );
                                updateQuantity(item._id, validQuantity);
                              }}
                              disabled={isUpdating}
                              className="w-16 text-center border border-gray-300 rounded px-2 py-1 disabled:bg-gray-100"
                            />
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= (product.quantity || 999) ||
                                isUpdating
                              }
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-lg font-semibold">
                            ${(product.price * item.quantity).toFixed(2)}
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={isUpdating}
                            className="ml-auto text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t">
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-sm text-gray-500">
                  💡 Free shipping on orders over $50
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full mb-3"
            >
              Proceed to Checkout
            </button>

            <div className="text-center text-sm text-gray-600">
              <span>🔒 Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Vietnam",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, paypal, stripe, bank_transfer
  const [orderNotes, setOrderNotes] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    // Pre-fill shipping address from user profile if available
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.username || "",
        phone: user.phone || "",
      }));

      // If user has saved addresses, use the default one
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddress =
          user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
        if (defaultAddress) {
          setShippingAddress({
            fullName: defaultAddress.fullName || user.username || "",
            phone: defaultAddress.phone || user.phone || "",
            street: defaultAddress.street || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            zipCode: defaultAddress.zipCode || "",
            country: defaultAddress.country || "Vietnam",
          });
        }
      }
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      if (response.data.success) {
        setCart(response.data.data);

        // Redirect if cart is empty
        if (response.data.data.items.length === 0) {
          toast.info("Your cart is empty");
          navigate("/cart");
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.response?.data?.message || "Failed to fetch cart");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const required = [
      "fullName",
      "phone",
      "street",
      "city",
      "state",
      "country",
    ];
    for (const field of required) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const productIds = cart.items.map((item) => item.product._id).join(",");
      const response = await api.get(
        `/coupons/validate/${couponCode.toUpperCase()}?productIds=${productIds}&totalAmount=${
          cart.subtotal
        }`
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        toast.success(
          `Coupon applied! You saved $${response.data.data.discount.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setStep(1);
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);

      // Calculate totals
      const shipping = cart.subtotal > 50 ? 0 : 5.99;
      const discount = appliedCoupon ? appliedCoupon.discount : 0;
      const subtotalAfterDiscount = Math.max(0, cart.subtotal - discount);
      const tax = subtotalAfterDiscount * 0.1;
      const total = subtotalAfterDiscount + shipping + tax;

      // Prepare order items
      const items = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.title,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.images ? item.product.images.split(",")[0] : "",
        seller: item.product.sellerId?._id || item.product.sellerId,
      }));

      console.log("Order items prepared:", items);
      console.log("Shipping address:", shippingAddress);

      const orderData = {
        items,
        shippingAddress,
        paymentMethod,
        itemsPrice: cart.subtotal,
        discountAmount: discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
        notes: orderNotes,
      };

      console.log("Order data to send:", orderData);

      const response = await api.post("/orders", orderData);

      if (response.data.success) {
        toast.success("Order placed successfully!");

        // Clear the cart
        await api.delete("/cart");

        // Redirect to order detail page
        navigate(`/orders/${response.data.data._id}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
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

  const shipping = cart.subtotal > 50 ? 0 : 5.99;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotalAfterDiscount = Math.max(0, cart.subtotal - discount);
  const tax = subtotalAfterDiscount * 0.1;
  const total = subtotalAfterDiscount + shipping + tax;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                } font-semibold`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 ${
                    step > s ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              step >= 1 ? "text-blue-600 font-semibold" : "text-gray-600"
            }
          >
            Shipping
          </span>
          <span
            className={
              step >= 2 ? "text-blue-600 font-semibold" : "text-gray-600"
            }
          >
            Payment
          </span>
          <span
            className={
              step >= 3 ? "text-blue-600 font-semibold" : "text-gray-600"
            }
          >
            Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleShippingChange}
                    required
                    placeholder="House number and street name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    if (validateShipping()) {
                      setStep(2);
                    }
                  }}
                  className="btn-primary"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              <div className="space-y-4">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: "💵" },
                  { value: "paypal", label: "PayPal", icon: "💳" },
                  { value: "stripe", label: "Credit/Debit Card", icon: "💳" },
                  {
                    value: "bank_transfer",
                    label: "Bank Transfer",
                    icon: "🏦",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="font-semibold">{method.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows="3"
                  placeholder="Any special instructions for your order..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Back to Shipping
                </button>
                <button onClick={() => setStep(3)} className="btn-primary">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Shipping Address Review */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-gray-700">
                  <p className="font-semibold">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.phone}</p>
                  <p>{shippingAddress.street}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.zipCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Method Review */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <button
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-700 capitalize font-semibold">
                  {paymentMethod.replace("_", " ")}
                </p>
                {orderNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 font-semibold mb-1">
                      Order Notes:
                    </p>
                    <p className="text-sm text-gray-700">{orderNotes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="divide-y">
                  {cart.items.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    const images = product.images
                      ? product.images.split(",")
                      : [];
                    const firstImage = images[0] || "";

                    return (
                      <div key={item._id} className="py-4 flex gap-4">
                        <img
                          src={firstImage || "/placeholder.png"}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Back to Payment
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="mb-4 pb-4 border-b">
              <label className="block text-sm font-semibold mb-2">
                🎟️ Have a coupon code?
              </label>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="font-mono font-semibold text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {appliedCoupon.description ||
                          "Coupon applied successfully!"}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>
                    Discount (
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discountValue}%`
                      : "Coupon"}
                    )
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-sm text-gray-500">
                  💡 Free shipping on orders over $50
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              <span>🔒 Secure Checkout</span>
            </div>

            {step < 3 && (
              <div className="text-sm text-gray-500">
                <p className="mb-2">📦 Estimated Delivery: 3-5 business days</p>
                <p>✅ 30-day return policy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, processing, shipped, delivered, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      confirmed: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="text-gray-600">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All Orders" },
          { value: "pending", label: "Pending" },
          { value: "processing", label: "Processing" },
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No orders found</h2>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "You haven't placed any orders yet"
              : `No ${filter} orders found`}
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="card hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${order.totalPrice?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items?.length}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="py-4 space-y-3">
                {order.items?.slice(0, 2).map((item, index) => {
                  const product = item.product;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image || product?.images ? (
                          <img
                            src={
                              item.image ||
                              (product?.images
                                ? product.images.split(",")[0]
                                : "")
                            }
                            alt={item.name || product?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {item.name || product?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {order.items?.length > 2 && (
                  <p className="text-sm text-gray-600 text-center pt-2">
                    + {order.items.length - 2} more{" "}
                    {order.items.length - 2 === 1 ? "item" : "items"}
                  </p>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Payment: </span>
                    <span className="font-semibold capitalize">
                      {order.paymentMethod?.replace("_", " ")}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-sm">
                      <span className="text-gray-600">Tracking: </span>
                      <span className="font-semibold">
                        {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="btn-secondary"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.response?.data?.message || "Failed to fetch order");
      toast.error(error.response?.data?.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      confirmed: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  if (error || !order) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The order you're looking for doesn't exist"}
          </p>
          <button onClick={() => navigate("/orders")} className="btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <button
        onClick={() => navigate("/orders")}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Order #{order.orderNumber || order._id.slice(-8)}
                </h1>
                <p className="text-gray-600">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-center ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status?.charAt(0).toUpperCase() +
                    order.status?.slice(1)}
                </span>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-center ${getPaymentStatusColor(
                    order.paymentStatus
                  )}`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                const product = item.product;
                return (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image || product?.images ? (
                        <img
                          src={
                            item.image ||
                            (product?.images
                              ? product.images.split(",")[0]
                              : "")
                          }
                          alt={item.name || product?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.name || product?.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p className="font-semibold">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Order Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items Price</span>
                <span>${order.itemsPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingPrice === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `$${order.shippingPrice?.toFixed(2) || "0.00"}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${order.taxPrice?.toFixed(2) || "0.00"}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  ${order.totalPrice?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p className="text-gray-700 capitalize">
                {order.paymentMethod?.replace("_", " ")}
              </p>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold mb-2">Tracking Information</h3>
                <p className="text-gray-700">
                  <span className="text-gray-600">Tracking #:</span>{" "}
                  <span className="font-mono">{order.trackingNumber}</span>
                </p>
                {order.carrier && (
                  <p className="text-gray-700">
                    <span className="text-gray-600">Carrier:</span>{" "}
                    {order.carrier}
                  </p>
                )}
                {order.estimatedArrival && (
                  <p className="text-gray-700">
                    <span className="text-gray-600">Estimated Arrival:</span>{" "}
                    {new Date(order.estimatedArrival).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Delivery Date */}
            {order.deliveredAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Delivered</p>
                <p className="text-sm text-green-700">
                  {new Date(order.deliveredAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order History</h3>
                <div className="space-y-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="font-semibold capitalize">
                          {history.status}
                        </span>
                      </div>
                      <p className="text-gray-600 ml-4 text-xs">
                        {new Date(history.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      {history.note && (
                        <p className="text-gray-600 ml-4 text-xs">
                          {history.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    avatarURL: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatarURL: user.avatarURL || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put("/users/profile", profileData);
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Update user in Redux store if needed
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await api.put("/users/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data.success) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please login to view your profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "profile"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "security"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "orders"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Order History
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile}>
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileData.avatarURL ? (
                    <img
                      src={profileData.avatarURL}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">
                      {profileData.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatarURL"
                    value={profileData.avatarURL}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Role Badge */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Account Type
                </label>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    user.role === "seller"
                      ? "bg-blue-100 text-blue-800"
                      : user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to original data
                      if (user) {
                        setProfileData({
                          username: user.username || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          bio: user.bio || "",
                          avatarURL: user.avatarURL || "",
                        });
                      }
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="max-w-4xl">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">View your order history on the Orders page</p>
              <Link to="/orders" className="btn-primary inline-block">
                Go to Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            onClick={() => navigate("/seller/coupons")}
            className="btn-secondary"
          >
            🎟️ Manage Coupons
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
  const [updatingStatus, setUpdatingStatus] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/seller", {
        params: filter !== "all" ? { status: filter } : {},
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success("Order status updated successfully");
        fetchOrders(); // Refresh orders
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      confirmed: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            key: "all",
            label: "All Orders",
            count: stats.all,
            color: "bg-gray-100 text-gray-800",
          },
          {
            key: "pending",
            label: "Pending",
            count: stats.pending,
            color: "bg-yellow-100 text-yellow-800",
          },
          {
            key: "processing",
            label: "Processing",
            count: stats.processing,
            color: "bg-blue-100 text-blue-800",
          },
          {
            key: "shipped",
            label: "Shipped",
            count: stats.shipped,
            color: "bg-purple-100 text-purple-800",
          },
          {
            key: "delivered",
            label: "Delivered",
            count: stats.delivered,
            color: "bg-green-100 text-green-800",
          },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`card text-center transition-all ${
              filter === stat.key ? "ring-2 ring-blue-600" : ""
            }`}
          >
            <div
              className={`text-3xl font-bold mb-1 ${
                filter === stat.key ? "text-blue-600" : ""
              }`}
            >
              {stat.count}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600">
              Orders will appear here when customers buy your products
            </p>
          </div>
        ) : (
          orders.map((order) => {
            // Get seller's items from this order
            const sellerItems =
              order.items?.filter(
                (item) =>
                  item.seller?._id?.toString() === user?._id ||
                  item.seller?.toString() === user?._id
              ) || [];

            if (sellerItems.length === 0) return null;

            const sellerTotal = sellerItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <div
                key={order._id}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${sellerTotal.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Your share</div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer</p>
                      <p className="font-semibold">
                        {order.buyerId?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.buyerId?.email || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Payment</p>
                      <p className="font-semibold capitalize">
                        {order.paymentMethod?.replace("_", " ")}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller's Items */}
                <div className="py-4 border-b">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Your Items ({sellerItems.length})
                  </p>
                  <div className="space-y-3">
                    {sellerItems.map((item, idx) => {
                      const product = item.product;
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {item.image || product?.images ? (
                              <img
                                src={
                                  item.image ||
                                  (product?.images
                                    ? product.images.split(",")[0]
                                    : "")
                                }
                                alt={item.name || product?.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {item.name || product?.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × ${item.price?.toFixed(2)}
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="py-4 border-b">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-800">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p>{order.shippingAddress?.phone}</p>
                    <p>{order.shippingAddress?.street}</p>
                    <p>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zipCode}
                    </p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Update Status:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      disabled={updatingStatus[order._id]}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Seller Coupons Management
const SellerCoupons = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage", // percentage or fixed
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    maxUsage: "",
    productIds: [],
    description: "",
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get("/coupons/seller");
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/seller/products?limit=100");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelection = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const couponData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : 0,
        maxDiscount: formData.maxDiscount
          ? parseFloat(formData.maxDiscount)
          : null,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
      };

      if (editingCoupon) {
        const response = await api.put(
          `/coupons/${editingCoupon._id}`,
          couponData
        );
        if (response.data.success) {
          toast.success("Coupon updated successfully!");
          fetchCoupons();
          handleCloseModal();
        }
      } else {
        const response = await api.post("/coupons", couponData);
        if (response.data.success) {
          toast.success("Coupon created successfully!");
          fetchCoupons();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : "",
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().split("T")[0]
        : "",
      maxUsage: coupon.maxUsage?.toString() || "",
      productIds: coupon.applicableProducts?.map((p) => p._id || p) || [],
      description: coupon.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await api.delete(`/coupons/${couponId}`);
      if (response.data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      maxUsage: "",
      productIds: [],
      description: "",
    });
  };

  const isExpired = (endDate) => {
    return endDate && new Date(endDate) < new Date();
  };

  const isActive = (coupon) => {
    const now = new Date();
    const start = coupon.startDate ? new Date(coupon.startDate) : null;
    const end = coupon.endDate ? new Date(coupon.endDate) : null;

    if (start && now < start) return false;
    if (end && now > end) return false;
    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage)
      return false;

    return coupon.isActive;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Coupons</h1>
          <p className="text-gray-600">
            Create and manage discount coupons for your products
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          ➕ Create Coupon
        </button>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🎟️</div>
          <h2 className="text-2xl font-bold mb-2">No coupons yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first coupon to offer discounts to customers
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="card">
              {/* Coupon Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold font-mono bg-blue-50 text-blue-600 px-3 py-1 rounded">
                      {coupon.code}
                    </h3>
                    {isActive(coupon) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Active
                      </span>
                    ) : isExpired(coupon.endDate) ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-gray-600">
                      {coupon.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Discount Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `$${coupon.discountValue} OFF`}
                </div>
                {coupon.minPurchase > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Min. purchase: ${coupon.minPurchase}
                  </p>
                )}
                {coupon.maxDiscount && coupon.discountType === "percentage" && (
                  <p className="text-sm text-gray-600">
                    Max. discount: ${coupon.maxDiscount}
                  </p>
                )}
              </div>

              {/* Coupon Details */}
              <div className="space-y-2 text-sm mb-4">
                {coupon.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-semibold">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {coupon.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">End:</span>
                    <span className="font-semibold">
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-semibold text-blue-600">
                    {coupon.usedCount || 0}{" "}
                    {coupon.maxUsage ? `/ ${coupon.maxUsage}` : "times"}
                  </span>
                </div>
                {coupon.applicableProducts &&
                  coupon.applicableProducts.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-semibold">
                        {coupon.applicableProducts.length} selected
                      </span>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="flex-1 btn-secondary text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., SUMMER2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Discount Type *
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder={
                          formData.discountType === "percentage"
                            ? "e.g., 20"
                            : "e.g., 10.00"
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Min Purchase & Max Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Minimum Purchase ($)
                      </label>
                      <input
                        type="number"
                        name="minPurchase"
                        value={formData.minPurchase}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formData.discountType === "percentage" && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Maximum Discount ($)
                        </label>
                        <input
                          type="number"
                          name="maxDiscount"
                          value={formData.maxDiscount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="No limit"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      name="maxUsage"
                      value={formData.maxUsage}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Unlimited"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description of this coupon..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Applicable Products (Optional)
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Leave empty to apply to all products
                    </p>
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                      {products.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No products available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {products.map((product) => (
                            <label
                              key={product._id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.productIds.includes(
                                  product._id
                                )}
                                onChange={() =>
                                  handleProductSelection(product._id)
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{product.title}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 btn-primary">
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
    activeUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsResponse = await api.get("/admin/stats");
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent orders
      const ordersResponse = await api.get("/admin/orders?limit=5");
      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data);
      }

      // Fetch recent users
      const usersResponse = await api.get("/admin/users?limit=5");
      if (usersResponse.data.success) {
        setRecentUsers(usersResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the admin control panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-blue-900">{stats.totalUsers}</h3>
              <p className="text-xs text-blue-600 mt-1">{stats.activeUsers} active</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Total Products */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-green-900">{stats.totalProducts}</h3>
              <p className="text-xs text-green-600 mt-1">Listed items</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-purple-900">{stats.totalOrders}</h3>
              <p className="text-xs text-purple-600 mt-1">All time</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-yellow-900">${stats.totalRevenue?.toFixed(2) || '0.00'}</h3>
              <p className="text-xs text-yellow-600 mt-1">Platform earnings</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Pending Disputes */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold mb-1">Pending Disputes</p>
              <h3 className="text-3xl font-bold text-red-900">{stats.pendingDisputes}</h3>
              <p className="text-xs text-red-600 mt-1">Needs attention</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <p className="text-sm text-indigo-600 font-semibold mb-3">Quick Actions</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/users")}
              className="w-full text-left px-3 py-2 bg-white hover:bg-indigo-50 rounded-lg text-sm font-semibold text-indigo-700 transition-colors"
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="w-full text-left px-3 py-2 bg-white hover:bg-indigo-50 rounded-lg text-sm font-semibold text-indigo-700 transition-colors"
            >
              📦 Manage Products
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      Order #{order.orderNumber || order._id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.buyerId?.username || "Unknown User"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${order.totalPrice?.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "seller"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // 'status', 'role', 'delete'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterRole !== "all") params.append("role", filterRole);
      if (filterStatus !== "all") params.append("status", filterStatus);
      params.append("limit", "100");

      const response = await api.get(`/admin/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      if (response.data.success) {
        toast.success(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      if (response.data.success) {
        toast.success("User role updated successfully");
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "seller":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      !searchTerm ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "all" || user.role === filterRole;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    return matchSearch && matchRole && matchStatus;
  });

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
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users in the system</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            🔍 Search
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.isActive).length}
          </p>
        </div>
        <div className="card bg-purple-50">
          <p className="text-sm text-gray-600 mb-1">Sellers</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === "seller").length}
          </p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">
                            {user.username}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          user.isActive
                        )}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user, "status")}
                          className={`px-3 py-1 rounded ${
                            user.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? "🔒" : "🔓"}
                        </button>
                        <button
                          onClick={() => openModal(user, "role")}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          title="Change Role"
                        >
                          👤
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {modalAction === "status" && "Change User Status"}
              {modalAction === "role" && "Change User Role"}
            </h3>

            {modalAction === "status" && (
              <div>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to{" "}
                  {selectedUser.isActive ? "deactivate" : "activate"}{" "}
                  <strong>{selectedUser.username}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedUser._id, selectedUser.isActive)
                    }
                    className="flex-1 btn-primary"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modalAction === "role" && (
              <div>
                <p className="text-gray-600 mb-4">
                  Select new role for <strong>{selectedUser.username}</strong>:
                </p>
                <div className="space-y-2 mb-4">
                  {["user", "seller", "admin"].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser._id, role)}
                      className={`w-full px-4 py-3 rounded-lg text-left font-semibold border-2 transition-colors ${
                        selectedUser.role === role
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="capitalize">{role}</span>
                      {selectedUser.role === role && (
                        <span className="ml-2 text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
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
  SellerCoupons,
  SellerStore,
  AdminDashboard,
  AdminUsers,
  AdminProducts,
  AdminOrders,
  AdminDisputes,
  NotFound,
};
