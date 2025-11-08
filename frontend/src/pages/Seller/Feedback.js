import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../services/api";

const SellerFeedback = () => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    rating: "",
    hasResponse: "",
    search: "",
  });
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 10);

      if (filters.rating) params.append("rating", filters.rating);
      if (filters.hasResponse)
        params.append("hasResponse", filters.hasResponse);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/reviews/seller?${params.toString()}`);

      if (response.data.success) {
        setReviews(response.data.data);
        setStatistics(response.data.statistics);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (reviewId) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/response`, {
        comment: responseText,
      });

      if (response.data.success) {
        toast.success("Response added successfully");
        setRespondingTo(null);
        setResponseText("");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add response");
    }
  };

  const handleUpdateResponse = async (reviewId) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const response = await api.put(`/reviews/${reviewId}/response`, {
        comment: responseText,
      });

      if (response.data.success) {
        toast.success("Response updated successfully");
        setRespondingTo(null);
        setResponseText("");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update response");
    }
  };

  const handleDeleteResponse = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this response?"))
      return;

    try {
      const response = await api.delete(`/reviews/${reviewId}/response`);

      if (response.data.success) {
        toast.success("Response deleted successfully");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete response");
    }
  };

  const startResponding = (review) => {
    setRespondingTo(review._id);
    setResponseText(review.sellerResponse?.comment || "");
  };

  const cancelResponding = () => {
    setRespondingTo(null);
    setResponseText("");
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="mt-2 text-gray-600">
            Manage and respond to customer feedback
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reviews
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.totalReviews}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.averageRating?.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Response Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.responseRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reviews
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Status
              </label>
              <select
                value={filters.hasResponse}
                onChange={(e) =>
                  handleFilterChange("hasResponse", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Reviews</option>
                <option value="true">Responded</option>
                <option value="false">Not Responded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No reviews found
            </h3>
            <p className="mt-2 text-gray-600">
              No customer reviews match your current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {review.user?.username?.[0]?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {review.user?.username || "Anonymous"}
                          </h3>
                          {review.isVerifiedPurchase && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {review.sellerResponse?.comment ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                          Responded
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
                          Pending Response
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    {review.product?.images && (
                      <img
                        src={review.product.images.split(",")[0]}
                        alt={review.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.product?.title}
                      </p>
                      <p className="text-sm text-gray-500">Product Review</p>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="mb-4">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Review ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Seller Response Section */}
                  {review.sellerResponse?.comment &&
                    respondingTo !== review._id && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                            <p className="font-semibold text-blue-900">
                              Your Response
                            </p>
                          </div>
                          <p className="text-xs text-blue-700">
                            {formatDate(review.sellerResponse.respondedAt)}
                          </p>
                        </div>
                        <p className="text-gray-800 mb-3">
                          {review.sellerResponse.comment}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startResponding(review)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResponse(review._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Response Form */}
                  {respondingTo === review._id ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {review.sellerResponse?.comment
                          ? "Edit Your Response"
                          : "Add Your Response"}
                      </label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows="4"
                        placeholder="Thank you for your feedback..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() =>
                            review.sellerResponse?.comment
                              ? handleUpdateResponse(review._id)
                              : handleAddResponse(review._id)
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {review.sellerResponse?.comment
                            ? "Update Response"
                            : "Post Response"}
                        </button>
                        <button
                          onClick={cancelResponding}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : !review.sellerResponse?.comment ? (
                    <div className="mt-4">
                      <button
                        onClick={() => startResponding(review)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Respond to Review
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && reviews.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerFeedback;
