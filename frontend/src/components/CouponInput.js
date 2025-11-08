import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { validateCoupon, removeCoupon } from "../redux/slices/couponSlice";
import { toast } from "react-toastify";
import { CheckCircle, Ticket, CaretDown, X, ListChecks } from "phosphor-react";

const CouponInput = ({ cartTotal, category = "" }) => {
  const dispatch = useDispatch();
  const { selectedCoupon, discountAmount, loading, error } = useSelector(
    (state) => state.coupon
  );
  const [couponCode, setCouponCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.warning("Please enter a coupon code");
      return;
    }

    try {
      const result = await dispatch(
        validateCoupon({
          code: couponCode,
          cartTotal,
          category,
        })
      ).unwrap();

      toast.success(
        `Coupon applied! Save $${result.calculatedDiscount.toFixed(2)}`
      );
      setCouponCode("");
      setIsExpanded(false);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleBrowseCoupons = () => {
    window.open("/browse-coupons", "_blank");
  };

  if (selectedCoupon) {
    // Show applied coupon
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={24} weight="fill" className="text-green-600" />
              <h3 className="font-semibold text-gray-900">Coupon Applied</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Code: {selectedCoupon.code}
            </p>
            <p className="text-lg font-bold text-green-700">
              Save ${discountAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-700">
            <Ticket size={20} weight="duotone" className="text-blue-600" />
            <span className="font-semibold">Have a coupon code?</span>
          </div>
          <CaretDown size={16} weight="bold" className="text-gray-400" />
        </button>
      ) : (
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Ticket size={20} weight="duotone" className="text-blue-600" />
            Apply Coupon Code
          </h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Validating..." : "Apply"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X size={16} weight="bold" /> {error}
              </p>
            )}

            <button
              onClick={handleBrowseCoupon}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <ListChecks size={16} weight="duotone" />
              Browse available coupons
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
