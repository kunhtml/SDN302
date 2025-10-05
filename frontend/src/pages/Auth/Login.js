import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, resetError } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);

  // Reset error khi component mount
  useEffect(() => {
    dispatch(resetError());
    return () => {
      dispatch(resetError());
    };
  }, [dispatch]);

  // Redirect nếu đã login - CHỈ KHI isAuthenticated === true
  useEffect(() => {
    if (isAuthenticated === true) {
      console.log(
        "🔄 Redirecting to home because isAuthenticated =",
        isAuthenticated
      );
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Show error khi có lỗi
  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto hide error after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(resetError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    if (error && showError) {
      setShowError(false);
      dispatch(resetError());
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    console.log("🎯 handleSubmit được gọi!", e.type, e.target); // Debug first

    // PHẢI có preventDefault NGAY ĐẦU TIÊN - Dùng try-catch để đảm bảo
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("✅ preventDefault + stopPropagation đã được gọi");
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi preventDefault:", err);
    }

    console.log("📧 Email:", formData.email);
    console.log("🔑 Password:", formData.password ? "***" : "empty");

    // Validation cơ bản
    if (!formData.email || !formData.password) {
      console.error("❌ Email hoặc password trống!");
      setShowError(true);
      return false; // Return false để chặn submit
    }

    // Gọi API login
    console.log("🚀 Dispatching login action...");

    dispatch(login(formData))
      .unwrap()
      .then((user) => {
        console.log("✅ Login successful!", user);
        // Navigate sẽ được handle bởi useEffect khi isAuthenticated thay đổi
      })
      .catch((error) => {
        console.error("❌ Login failed:", error);
        setShowError(true);
      });

    return false; // Return false để chắc chắn không submit form
  };

  const closeErrorAlert = () => {
    setShowError(false);
    dispatch(resetError());
  };

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!error) return "";

    const errorStr = String(error).toLowerCase();

    if (
      errorStr.includes("email") ||
      errorStr.includes("user not found") ||
      errorStr.includes("user does not exist")
    ) {
      return "❌ Email address not found. Please check your email or create a new account.";
    }
    if (
      errorStr.includes("password") ||
      errorStr.includes("incorrect") ||
      errorStr.includes("invalid password")
    ) {
      return "❌ Incorrect password. Please try again or reset your password.";
    }
    if (
      errorStr.includes("network") ||
      errorStr.includes("fetch") ||
      errorStr.includes("connection")
    ) {
      return "❌ Network error. Please check your internet connection and try again.";
    }
    if (
      errorStr.includes("invalid credentials") ||
      errorStr.includes("unauthorized")
    ) {
      return "❌ Invalid email or password. Please check your credentials and try again.";
    }

    return `❌ ${error}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-100">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 transform hover:rotate-6 transition-transform duration-300">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} noValidate>
            {/* Error Alert - Enhanced */}
            {error && showError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake relative">
                <div className="flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Authentication Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {getErrorMessage()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeErrorAlert}
                    className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to our platform?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
            >
              Create new account
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Protected by reCAPTCHA and subject to the{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
