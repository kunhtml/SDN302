import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
