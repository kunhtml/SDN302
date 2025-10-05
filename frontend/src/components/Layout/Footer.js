import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <p className="text-gray-400 text-sm">
              eBay Clone is a modern e-commerce platform connecting buyers and
              sellers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@ebayclone.com</li>
              <li>Phone: +84 123 456 789</li>
              <li>Address: Ho Chi Minh City, Vietnam</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 eBay Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
