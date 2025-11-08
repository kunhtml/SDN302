import React, { useState, useRef, useEffect } from "react";
import { uploadImageToFreeImage, previewImage } from "../../utils/uploadImage";
import { toast } from "react-toastify";

const ImageUpload = ({ currentImage, onImageChange, label = "Avatar" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    currentImage || "https://via.placeholder.com/150"
  );
  const fileInputRef = useRef(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Show preview immediately
      const previewUrl = await previewImage(file);
      setPreview(previewUrl);

      // Upload to FreeImage.host
      setUploading(true);
      toast.info("Uploading image...");

      const imageUrl = await uploadImageToFreeImage(file);

      setPreview(imageUrl);
      onImageChange(imageUrl);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      // Revert preview on error
      setPreview(currentImage || "https://via.placeholder.com/150");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview("https://via.placeholder.com/150");
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-6 mb-6">
      {/* Image Preview */}
      <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group flex-shrink-0">
        {preview && preview !== "https://via.placeholder.com/150" ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-4xl text-white opacity-50">📸</span>
          </div>
        )}

        {/* Overlay on hover */}
        {!uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <button
              type="button"
              onClick={handleClick}
              className="text-white text-xs font-semibold"
            >
              Change
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <label className="block text-sm font-semibold mb-2">{label}</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>📤 Upload Image</>
            )}
          </button>

          {preview &&
            preview !== "https://via.placeholder.com/150" &&
            !uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
              >
                🗑️ Remove
              </button>
            )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Supports: JPG, PNG, GIF, WebP (Max 32MB)
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
