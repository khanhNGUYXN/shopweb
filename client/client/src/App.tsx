// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/home/Home';
import CategoryPage from './pages/category/CategoryPage';
import LoginPage from './pages/login/LoginPage';
import ProductDetail from './pages/product/ProductDetailPage';
import UserAccount from './pages/account/UserAccount';
import ProtectedRoute from './components/route/ProtectedRoute';
import CartList from './pages/cart/CartList';
import Checkout from './pages/pay/pay';
import OrderConfirmation from './pages/order/order-confirmation';
import ListOrders from './pages/order/ListOrder';
import AdminLayout from './components/layout/AdminLayout';
import AdminPage from './admin/AdminPage';
import AddCategoryForm from './admin/AddCategoryForm';
import AllProducts from './admin/AllProductsAdmin';
import AddProductForm from './admin/AddProductForm';
import OrderPage from './admin/OrderPage';
import UserManagementPage from './admin/UserManagementPage';
import Register from './pages/register/Register';
import ForgotPassword from './pages/forgotpassword/ForgotPassword';
import ResetPassword from './pages/forgotpassword/ResetPassword';
import EditProductForm from './admin/EditProduct';
import ChatbotAssistant from './components/ChatbotAssistant';
const App: React.FC = () => {
  return (
    <Routes>
      {/* Route gốc sử dụng Layout cho người dùng */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="danh-muc/:category" element={<CategoryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<CartList />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-confirmation" element={<OrderConfirmation />} />
        <Route path="list-orders" element={<ListOrders />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="account" 
          element={
            <ProtectedRoute>
              <UserAccount />
            </ProtectedRoute>
          } 
        />
      </Route>
       {/* Route cho admin */}
       <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Đặt path của child route là "add-category" */}
        <Route path="add-category" element={<AddCategoryForm />} />
        <Route path="all-products" element={<AllProducts />} />
        <Route path="add-product" element={<AddProductForm />} />
        <Route path="edit-product" element={<EditProductForm />} />
        <Route path="orders" element={<OrderPage />} />
        <Route path="manager" element={<UserManagementPage />} />
      </Route>
    </Routes>
  );
};

export default App;
