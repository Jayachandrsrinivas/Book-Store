import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Truck, Calendar, DollarSign, ExternalLink } from 'lucide-react';

const OrderHistory = () => {
  const { apiCall } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const data = await apiCall('/orders/myorders');
      setOrders(data);
    } catch (err) {
      setError('Failed to load order history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered': return 'badge-success';
      case 'shipped': return 'badge-info';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShoppingBag size={32} color="var(--accent-primary)" />
        <span>Your Orders</span>
      </h1>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : error ? (
        <div className="alert-box alert-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-secondary)' }}>
          <h3>No orders placed yet</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't purchased any books yet. Start exploring our vast bookstore catalog!</p>
          <Link to="/" className="btn btn-primary">Discover Books</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              {/* Order Header info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ORDER NUMBER</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{order.orderID}</span>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem' }}>
                      {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} color="var(--text-muted)" />
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      {item.bookId ? (
                        <Link to={`/books/${item.bookId._id}`} style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} className="hover-link">
                          <span>{item.bookId.title}</span>
                          <ExternalLink size={12} color="var(--accent-primary)" />
                        </Link>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Unavailable Book Catalog Listing</span>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <span>Quantity: <strong>{item.quantity}</strong></span>
                        <span>&bull;</span>
                        <span>Format: <strong>{item.format.toUpperCase()}</strong></span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-link:hover {
          color: var(--accent-primary) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
