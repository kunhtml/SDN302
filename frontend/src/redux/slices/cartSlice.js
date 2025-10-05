import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

const initialState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
};

// Fetch cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (item, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/items", item);
      toast.success("Item added to cart");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update cart item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success("Item removed from cart");
      return itemId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/cart");
      toast.success("Cart cleared");
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
      });
  },
});

export default cartSlice.reducer;
