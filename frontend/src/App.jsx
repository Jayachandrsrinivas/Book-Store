import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import UserHome from './pages/UserHome';
import BooksList from './pages/BooksList';
import BookDetail from './pages/BookDetail';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerAddBook from './pages/SellerAddBook';
import SellerOrders from './pages/SellerOrders';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Guest Landing */}
        <Route path="/" element={<Home />} />
        
        {/* Auth page */}
        <Route path="/login" element={<LoginRegister />} />

        {/* User Role Pages */}
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/books" element={<BooksList />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* Seller Role Pages */}
        <Route path="/seller-home" element={<SellerDashboard />} />
        <Route path="/my-products" element={<SellerProducts />} />
        <Route path="/add-books" element={<SellerAddBook />} />
        <Route path="/seller-orders" element={<SellerOrders />} />

        {/* Admin Role Pages */}
        <Route path="/admin-home" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminDashboard />} />
        <Route path="/admin-sellers" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
