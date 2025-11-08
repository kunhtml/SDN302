import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { setCredentials } from "../redux/slices/authSlice";
import {
  Crown,
  Storefront,
  ShoppingBag,
  Sparkle,
  Lightbulb,
} from "phosphor-react";

const RoleSwitcher = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [showSellerRequest, setShowSellerRequest] = useState(false);
  const [sellerFormData, setSellerFormData] = useState({
    phoneNumber: user?.phone || "",
    description: user?.bio || "",
  });

  const currentRole = user?.role || "user";

  const handleSwitchRole = async (targetRole) => {
    if (switching) return;

    try {
      setSwitching(true);
      const response = await api.post("/users/switch-role", { targetRole });

      if (response.data.success) {
        const { user: updatedUser, token } = response.data.data;

        // Update auth state
        dispatch(setCredentials({ user: updatedUser, token }));

        // Update localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(response.data.message);

        // Navigate based on new role
        if (targetRole === "seller") {
          navigate("/seller");
        } else {
          navigate("/");
        }

        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error(error.response?.data?.message || "Failed to switch role");
    } finally {
      setSwitching(false);
    }
  };

  const handleRequestSeller = async (e) => {
    e.preventDefault();

    if (!sellerFormData.phoneNumber) {
      toast.error("Please provide your phone number");
      return;
    }

    try {
      setSwitching(true);
      const response = await api.post("/users/request-seller", sellerFormData);

      if (response.data.success) {
        const { user: updatedUser, token } = response.data.data;

        // Update auth state
        dispatch(setCredentials({ user: updatedUser, token }));

        // Update localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(response.data.message);
        navigate("/seller");

        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error requesting seller:", error);
      toast.error(
        error.response?.data?.message || "Failed to request seller access"
      );
    } finally {
      setSwitching(false);
    }
  };

  if (currentRole === "admin") {
    return (
      <div className="p-6 text-center">
        <Crown
          size={64}
          weight="fill"
          className="text-purple-600 mx-auto mb-4"
        />
        <h3 className="text-xl font-bold mb-2">Admin Account</h3>
        <p className="text-gray-600">
          You are logged in as an administrator. Admin accounts cannot switch
          roles.
        </p>
      </div>
    );
  }

  if (showSellerRequest && currentRole === "user") {
    return (
      <div className="p-6">
        <button
          onClick={() => setShowSellerRequest(false)}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="text-center mb-6">
          <Storefront
            size={64}
            weight="duotone"
            className="text-blue-600 mx-auto mb-4"
          />
          <h3 className="text-2xl font-bold mb-2">Become a Seller</h3>
          <p className="text-gray-600">
            Start selling your products and reach millions of buyers
          </p>
        </div>

        <form onSubmit={handleRequestSeller} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={sellerFormData.phoneNumber}
              onChange={(e) =>
                setSellerFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              required
              placeholder="+84 123 456 789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Tell us about your business (Optional)
            </label>
            <textarea
              value={sellerFormData.description}
              onChange={(e) =>
                setSellerFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows="4"
              placeholder="Describe what you plan to sell..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkle size={20} weight="fill" className="text-blue-600" />{" "}
              Seller Benefits:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Reach millions of active buyers</li>
              <li>• Easy product management tools</li>
              <li>• Real-time order tracking</li>
              <li>• Secure payment processing</li>
              <li>• Marketing and analytics dashboard</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={switching}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {switching ? "Processing..." : "Start Selling Now"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Switch Mode</h3>
        <p className="text-gray-600">Choose how you want to use the platform</p>
      </div>

      <div className="space-y-4">
        {/* Buyer Mode */}
        <button
          onClick={() => handleSwitchRole("user")}
          disabled={currentRole === "user" || switching}
          className={`w-full p-6 rounded-lg border-2 transition-all ${
            currentRole === "user"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
          } ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-4">
            <ShoppingBag size={48} weight="duotone" className="text-blue-600" />
            <div className="flex-1 text-left">
              <h4 className="text-xl font-bold mb-1">Buyer Mode</h4>
              <p className="text-sm text-gray-600">
                Browse products, shop, and manage your orders
              </p>
            </div>
            {currentRole === "user" && (
              <div className="text-blue-600 font-semibold">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Seller Mode */}
        {currentRole === "seller" ? (
          <button
            onClick={() => handleSwitchRole("user")}
            disabled={switching}
            className={`w-full p-6 rounded-lg border-2 border-blue-600 bg-blue-50 transition-all ${
              switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <Storefront
                size={48}
                weight="duotone"
                className="text-blue-600"
              />
              <div className="flex-1 text-left">
                <h4 className="text-xl font-bold mb-1">Seller Mode</h4>
                <p className="text-sm text-gray-600">
                  Manage your products, orders, and store
                </p>
              </div>
              <div className="text-blue-600 font-semibold">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setShowSellerRequest(true)}
            disabled={switching}
            className={`w-full p-6 rounded-lg border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all ${
              switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <Storefront
                size={48}
                weight="duotone"
                className="text-green-600"
              />
              <div className="flex-1 text-left">
                <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
                  Seller Mode
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    New
                  </span>
                </h4>
                <p className="text-sm text-gray-600">
                  Become a seller and start earning
                </p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
          <Lightbulb size={16} weight="fill" className="text-yellow-500" />
          You can switch between modes anytime from your profile
        </p>
      </div>
    </div>
  );
};

export default RoleSwitcher;
