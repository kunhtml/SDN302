const express = require("express");
const router = express.Router();
const axios = require("axios");
const formData = require("form-data");

// FreeImage.host API Key
const FREEIMAGE_API_KEY =
  process.env.FREEIMAGE_API_KEY || "6d207e02198a847aa98d0a2a901485a5";

/**
 * @route   POST /api/upload/image
 * @desc    Upload image to FreeImage.host
 * @access  Public (can add protect middleware if needed)
 */
router.post("/image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image data provided",
      });
    }

    // Validate base64 format
    if (!image.includes("base64,")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Expected base64 data URL",
      });
    }

    // Extract base64 string (remove data URL prefix)
    const base64String = image.split(",")[1];

    // Create form data for FreeImage.host API
    const form = new formData();
    form.append("key", FREEIMAGE_API_KEY);
    form.append("source", base64String);
    form.append("format", "json");

    // Upload to FreeImage.host
    const response = await axios.post(
      "https://freeimage.host/api/1/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    if (response.data && response.data.image && response.data.image.url) {
      return res.status(200).json({
        success: true,
        data: {
          url: response.data.image.url,
          displayUrl: response.data.image.display_url,
          deleteUrl: response.data.image.delete_url,
        },
      });
    } else {
      throw new Error("Failed to get image URL from FreeImage.host");
    }
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to upload image",
    });
  }
});

module.exports = router;
