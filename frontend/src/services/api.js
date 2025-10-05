// src/services/api.js
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle unauthorized
      if (status === 401) {
        const token = localStorage.getItem("token");
        if (token) {
          // Lazy import to avoid circular dependency
          const { store } = await import("../redux/store");
          const { logout } = await import("../redux/slices/authSlice");
          store.dispatch(logout());
          toast.error("Session expired. Please login again.");
        }
      }

      // Handle forbidden
      if (status === 403) {
        toast.error("You don't have permission to perform this action.");
      }

      // Handle not found
      if (status === 404) {
        toast.error(data.message || "Resource not found.");
      }

      // Handle server errors
      if (status >= 500) {
        toast.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
