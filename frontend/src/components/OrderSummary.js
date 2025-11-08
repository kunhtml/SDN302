import React from "react";
import { useSelector } from "react-redux";
import CouponInput from "./CouponInput";

const OrderSummary = ({ items = [], shippingCost = 10 }) => {
  const { selectedCoupon, discountAmount } = useSelector(
    (state) => state.coupon
  );

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // Calculate total
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax - discountAmount;

  return (
    <div className="space-y-6">
      {/* Coupon Input */}
      <CouponInput cartTotal={subtotal} />

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {items.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Items (
                {items.reduce((sum, item) => sum + (item.quantity || 1), 0)})
              </span>
              <span className="text-gray-900">
                {items.length} product{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-gray-900">
              ${shippingCost.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-semibold text-gray-900">
              ${tax.toFixed(2)}
            </span>
          </div>

          {selectedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({selectedCoupon.code})</span>
              <span className="font-semibold">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            ${Math.max(0, total).toFixed(2)}
          </span>
        </div>

        {selectedCoupon && discountAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
            ✓ You're saving ${discountAmount.toFixed(2)} with this coupon!
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
