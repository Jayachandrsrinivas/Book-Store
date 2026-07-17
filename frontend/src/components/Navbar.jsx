import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderGuestLinks = () => (
    <div className="d-flex align-items-center gap-2">
      <Link to="/login?role=user" className="btn btn-danger px-3 py-1 fw-bold rounded-1 border-0" style={{ backgroundColor: '#8B0000' }}>User</Link>
      <Link to="/login?role=seller" className="btn btn-success px-3 py-1 fw-bold rounded-1 border-0" style={{ backgroundColor: '#4D6E3F' }}>Seller</Link>
      <Link to="/login?role=admin" className="btn btn-warning text-white px-3 py-1 fw-bold rounded-1 border-0" style={{ backgroundColor: '#B85D30' }}>Admin</Link>
    </div>
  );

  const renderUserLinks = () => (
    <div className="navbar-nav ms-auto align-items-center">
      <Link className="nav-link" to="/user-home">Home</Link>
      <Link className="nav-link" to="/books">Books</Link>
      <Link className="nav-link" to="/wishlist">Wishlist</Link>
      <Link className="nav-link" to="/my-orders">My Orders</Link>
      <button onClick={handleLogout} className="nav-link btn btn-link border-0 text-start" style={{ textDecoration: 'none' }}>Logout</button>
      <span className="navbar-text ms-2">({user.name})</span>
    </div>
  );

  const renderSellerLinks = () => (
    <div className="navbar-nav ms-auto align-items-center">
      <Link className="nav-link" to="/seller-home">Home</Link>
      <Link className="nav-link" to="/my-products">My Products</Link>
      <Link className="nav-link" to="/add-books">Add Books</Link>
      <Link className="nav-link" to="/seller-orders">Orders</Link>
      <button onClick={handleLogout} className="nav-link btn btn-link border-0 text-start" style={{ textDecoration: 'none' }}>Logout</button>
      <span className="navbar-text ms-2">({user.name})</span>
    </div>
  );

  const renderAdminLinks = () => (
    <div className="navbar-nav ms-auto align-items-center">
      <Link className="nav-link" to="/admin-home">Home</Link>
      <Link className="nav-link" to="/admin-users">Users</Link>
      <Link className="nav-link" to="/admin-sellers">Sellers</Link>
      <button onClick={handleLogout} className="nav-link btn btn-link border-0 text-start" style={{ textDecoration: 'none' }}>Logout</button>
      <span className="navbar-text ms-2">({user.name})</span>
    </div>
  );

  // Determine brand name based on login state and role
  const getBrandDetails = () => {
    if (!user) return { name: 'BookVerse', path: '/' };
    if (user.role === 'user') return { name: 'BookStore', path: '/user-home' };
    if (user.role === 'seller') return { name: 'BookStore (Seller)', path: '/seller-home' };
    if (user.role === 'admin') return { name: 'BookStore (Admin)', path: '/admin-home' };
    return { name: 'BookVerse', path: '/' };
  };

  const brand = getBrandDetails();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to={brand.path}>
          {!user && <span className="fs-4">📚</span>}
          <span>{brand.name}</span>
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="ms-auto">
            {!user && renderGuestLinks()}
            {user && user.role === 'user' && renderUserLinks()}
            {user && user.role === 'seller' && renderSellerLinks()}
            {user && user.role === 'admin' && renderAdminLinks()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
