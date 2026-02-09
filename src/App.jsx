import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import NewIn from './pages/NewIn';
import Collections from './pages/Collections';
import Studio from './pages/Studio'; // Keep if used or remove if replaced by Studios
import Shipping from './pages/Shipping';
import Membership from './pages/Membership';
import Support from './pages/Support';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout'; // Restore
import Studios from './pages/Studios';
import Search from './pages/Search';
import DripDNA from './pages/DripDNA';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <Router>
            <Toaster position="bottom-right" reverseOrder={false} /> {/* Add Toaster here */}
            <Routes>
              {/* Main Application Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="new-in" element={<NewIn />} />
                <Route path="search" element={<Search />} />
                <Route path="collections" element={<Collections />} />
                <Route path="studios" element={<Studios />} />
                <Route path="shipping" element={<Shipping />} />
                <Route path="membership" element={<Membership />} />
                <Route path="support" element={<Support />} />
                <Route path="drip-dna" element={<DripDNA />} />
                <Route path="login" element={<Login />} />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="order-success" element={<OrderSuccess />} />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="order/:id" element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
