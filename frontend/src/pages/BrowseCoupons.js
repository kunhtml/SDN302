import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAvailableCoupons } from "../redux/slices/couponSlice";
import { toast } from "react-toastify";
import { Confetti, Check, ClipboardText, Lightbulb } from "phosphor-react";

const BrowseCoupons = () => {
  const dispatch = useDispatch();
  const { availableCoupons, loading, error } = useSelector(
    (state) => state.coupon
  );
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    dispatch(getAvailableCoupons());
  }, [dispatch]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code copied: ${code}`);

    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountLabel = (coupon) => {
    if (coupon.discountPercent > 0) {
      return `${coupon.discountPercent}% OFF`;
    } else if (coupon.discountAmount > 0) {
      return `$${coupon.discountAmount.toFixed(2)} OFF`;
    }
    return "Special Deal";
  };

  const getUsagePercentage = (coupon) => {
    return Math.round((coupon.usageCount / coupon.maxUsage) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Confetti size={32} weight="duotone" className="text-blue-600" />
            Available Coupons & Deals
          </h1>
          <p className="text-gray-600">
            Browse and copy coupon codes to use in your next order
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {availableCoupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No active coupons at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCoupons.map((coupon, index) => (
              <div
                key={coupon._id || index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-2 border-blue-100"
              >
                {/* Header with discount badge */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-3xl font-bold mb-1">
                        {getDiscountLabel(coupon)}
                      </div>
                      <p className="text-blue-100 text-sm">
                        {coupon.description}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-2 rounded">
                      <p className="text-xs font-semibold">CODE</p>
                    </div>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-300">
                      <code className="flex-1 font-mono font-bold text-gray-800 text-lg">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className={`px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1 ${
                          copiedCode === coupon.code
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check size={16} weight="bold" /> Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardText size={16} weight="duotone" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  {coupon.applicableCategories &&
                    coupon.applicableCategories.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          APPLICABLE TO:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {coupon.applicableCategories.map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Usage stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Usage</span>
                      <span className="text-gray-900 font-semibold">
                        {coupon.usageCount} / {coupon.maxUsage}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${getUsagePercentage(coupon)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {100 - getUsagePercentage(coupon)}% remaining
                    </p>
                  </div>

                  {/* Use Now Button */}
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use This Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb size={24} weight="duotone" className="text-yellow-500" />
            How to Use Coupons
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Browse available coupons on this page</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Click "Copy" to copy the coupon code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Add items to your cart</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Paste the code during checkout to apply discount</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrowseCoupons;
