import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { FloatingContact } from './components/common/FloatingContact';
import { TrustStrip } from './components/common/TrustStrip';

import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { OrderSuccess } from './pages/OrderSuccess';
import { Account } from './pages/Account';
import { Contact } from './pages/Contact';
import { About } from './pages/About';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminSettings } from './pages/admin/AdminSettings';

// Layout wrapper that hides storefront Navbar/Footer on Admin routes
const MainAppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#1A1A1A]">
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          {/* Admin Panel Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOrders />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && (
        <>
          <TrustStrip />
          <Footer />
          <FloatingContact />
          <CheckoutModal />
        </>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <MainAppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
