import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import { fetchCart } from "./redux/slices/cartSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import {
  Products,
  ProductDetail,
  Cart,
  Checkout,
  Orders,
  OrderDetail,
  Profile,
  Chat,
  SellerDashboard,
  SellerProducts,
  AddProduct,
  SellerOrders,
  SellerCoupons,
  SellerStore,
  AdminDashboard,
  AdminUsers,
  AdminUserDetail,
  AdminProducts,
  AdminOrders,
  AdminDisputes,
  NotFound,
} from "./pages";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={["buyer", "seller", "admin"]} />
            }
          >
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:conversationId" element={<Chat />} />
          </Route>

          <Route
            path="seller"
            element={<ProtectedRoute allowedRoles={["seller"]} />}
          >
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="coupons" element={<SellerCoupons />} />
            <Route path="store" element={<SellerStore />} />
          </Route>

          <Route
            path="admin"
            element={<ProtectedRoute allowedRoles={["admin"]} />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="disputes" element={<AdminDisputes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
