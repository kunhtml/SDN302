const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true, // Allow multiple null values
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// Index for search
categorySchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Category", categorySchema);
