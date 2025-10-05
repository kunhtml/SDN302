import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
};

// Fetch orders
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders", orderData);
      toast.success("Order placed successfully!");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create order";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.order = action.payload;
      });
  },
});

export default orderSlice.reducer;
