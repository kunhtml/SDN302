import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import {
  FiShoppingCart,
  FiBell,
  FiUser,
  FiSearch,
  FiMessageSquare,
} from "react-icons/fi";
// RoleSwitcher removed from header per UX change: requests handled from profile

const Header = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { unreadCount } = useSelector((state) => state.notification);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // role switcher removed: users request seller from profile
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;

    const roleConfig = {
      user: { label: "Buyer", color: "bg-blue-100 text-blue-700", icon: "🛍️" },
      seller: {
        label: "Seller",
        color: "bg-green-100 text-green-700",
        icon: "🏪",
      },
      admin: {
        label: "Admin",
        color: "bg-purple-100 text-purple-700",
        icon: "👑",
      },
    };

    const config = roleConfig[user.role] || roleConfig.user;

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full ${config.color} font-semibold`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            eBay Clone
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600">
                <FiSearch size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative hover:text-blue-600">
                  <FiShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link to="/chat" className="relative hover:text-blue-600">
                  <FiMessageSquare size={24} />
                </Link>

                <Link
                  to="/notifications"
                  className="relative hover:text-blue-600"
                >
                  <FiBell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 hover:text-blue-600"
                  >
                    <FiUser size={24} />
                    <div className="flex flex-col items-start">
                      <span>{user?.firstName}</span>
                      {getRoleBadge()}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role !== "admin" && user?.role !== "seller" && (
                        <Link
                          to="/orders"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                      )}

                      {/* Role switching removed from header. Users can request seller access from their Profile page. */}

                      {user?.role === "seller" && (
                        <Link
                          to="/seller"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Seller Dashboard
                        </Link>
                      )}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* RoleSwitcher modal removed */}
    </header>
  );
};

export default Header;
