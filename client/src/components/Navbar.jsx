import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BookOpen, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Menu, X, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={() => setIsOpen(false)}>
        <BookOpen size={28} />
        <span>BookStore</span>
      </Link>

      {/* Hamburger Menu for Mobile */}
      <div style={{ display: 'none', cursor: 'pointer' }} className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      <ul className={`nav-links ${isOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
        <li>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Browse
          </NavLink>
        </li>

        <li>
          <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="badge badge-info" style={{ marginLeft: '4px', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                {cartCount}
              </span>
            )}
          </NavLink>
        </li>

        {user ? (
          <>
            <li>
              <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <ClipboardList size={18} />
                <span>My Orders</span>
              </NavLink>
            </li>

            {user.role === 'seller' && (
              <li>
                <NavLink to="/seller" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} />
                  <span>Seller Hub</span>
                </NavLink>
              </li>
            )}

            {user.role === 'admin' && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} />
                  <span>Admin Hub</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <UserIcon size={18} />
                <span>{user.name}</span>
              </NavLink>
            </li>

            <li>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Basic Inline Styles for Mobile Nav Toggle compatibility */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block !important;
          }
          .nav-links {
            display: ${isOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background: #131b2e;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            gap: 1rem !important;
            align-items: stretch !important;
          }
          .nav-links li {
            width: 100%;
          }
          .nav-links button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
