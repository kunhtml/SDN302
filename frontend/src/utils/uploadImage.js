import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

/**
 * Upload image via backend proxy to FreeImage.host
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of uploaded image
 */
export const uploadImageToFreeImage = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload JPG, PNG, GIF, WebP, or BMP images"
      );
    }

    // Validate file size (max 32MB)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 32MB");
    }

    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Keep full data URL with prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Upload via backend API to FreeImage.host
    const response = await axios.post(`${API_URL}/upload/image`, {
      image: base64,
    });

    if (response.data && response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error("Failed to get image URL from response");
    }
  } catch (error) {
    console.error("Error uploading image:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to upload image. Please try again.");
    }
  }
};

/**
 * Upload multiple images via backend proxy to FreeImage.host
 * @param {FileList} files - List of image files
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = Array.from(files).map((file) =>
      uploadImageToFreeImage(file)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

/**
 * Preview image before upload
 * @param {File} file - Image file
 * @returns {Promise<string>} - Data URL for preview
 */
export const previewImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
