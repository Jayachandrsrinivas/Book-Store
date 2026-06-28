import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, Plus, Minus, CreditCard, ChevronRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = getCartTotal();

  const handleCheckout = async () => {
    setError('');
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    setLoading(true);
    try {
      // Map cartItems to what backend expects
      const itemsPayload = cartItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        format: item.format,
      }));

      const response = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: itemsPayload }),
      });

      clearCart();
      // Route to confirmation view passing the order ID
      navigate(`/orders/confirmation/${response._id}`);
    } catch (err) {
      setError(err.message || 'Checkout failed. Please inspect stocks.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Browse our catalog, discover amazing titles, and load up your books to get started.
          </p>
          <Link to="/" className="btn btn-primary">Start Browsing</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShoppingBag size={32} color="var(--accent-primary)" />
        <span>Shopping Cart</span>
      </h1>

      {error && <div className="alert-box alert-error">{error}</div>}

      <div className="grid grid-cols-3" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Cart items list */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map((item) => (
            <div
              key={`${item.bookId}-${item.format}`}
              className="glass-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '1.15rem' }}>{item.title}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {item.format.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    ${item.price.toFixed(2)} each
                  </span>
                </div>
              </div>

              {/* Quantity selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50px',
                    padding: '2px',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.bookId, item.format, item.quantity - 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.bookId, item.format, item.quantity + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.bookId, item.format)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: '8px', borderRadius: 'var(--radius-sm)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order pricing summary card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--accent-success)', fontWeight: '600' }}>FREE</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: '800',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--accent-primary)' }}>${total.toFixed(2)}</span>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
          >
            <CreditCard size={18} />
            <span>{loading ? 'Processing Order...' : 'Place Order'}</span>
            <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
          </button>

          {!user && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Note: You will be redirected to Log In before finalizing this order checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
