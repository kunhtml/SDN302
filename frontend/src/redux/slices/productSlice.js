import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  filters: {
    category: "",
    minPrice: 0,
    maxPrice: 0,
    search: "",
    sort: "createdAt",
  },
};

// Fetch products
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters } = productSlice.actions;
export default productSlice.reducer;
