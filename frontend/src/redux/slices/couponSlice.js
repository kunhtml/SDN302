import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/**
 * Async thunks for coupon operations
 */
export const getAvailableCoupons = createAsyncThunk(
  "coupon/getAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/coupons/available");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons"
      );
    }
  }
);

export const validateCoupon = createAsyncThunk(
  "coupon/validate",
  async ({ code, cartTotal, category }, { rejectWithValue }) => {
    try {
      const response = await api.post("/coupons/validate", {
        code,
        cartTotal,
        applicableCategory: category,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid coupon code"
      );
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "coupon/apply",
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await api.post("/coupons/apply", { code });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply coupon"
      );
    }
  }
);

const initialState = {
  availableCoupons: [],
  selectedCoupon: null,
  discountAmount: 0,
  loading: false,
  error: null,
  success: false,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.selectedCoupon = null;
      state.discountAmount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    calculateDiscount: (state, action) => {
      const { cartTotal } = action.payload;
      if (!state.selectedCoupon) return;

      let discount = 0;
      if (state.selectedCoupon.discountPercent > 0) {
        discount = (cartTotal * state.selectedCoupon.discountPercent) / 100;
      } else if (state.selectedCoupon.discountAmount > 0) {
        discount = state.selectedCoupon.discountAmount;
      }

      state.discountAmount = Math.min(discount, cartTotal);
    },
  },
  extraReducers: (builder) => {
    // Get Available Coupons
    builder
      .addCase(getAvailableCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCoupons = action.payload;
        state.success = true;
      })
      .addCase(getAvailableCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Validate Coupon
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCoupon = action.payload;
        state.discountAmount = action.payload.calculatedDiscount;
        state.success = true;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedCoupon = null;
        state.discountAmount = 0;
      });

    // Apply Coupon
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCoupon = action.payload;
        state.success = true;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeCoupon, clearError, calculateDiscount } =
  couponSlice.actions;
export default couponSlice.reducer;
