import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Calendar, ShieldCheck, ShoppingBag } from 'lucide-react';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { apiCall } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const data = await apiCall(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError('Failed to load order receipt details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="main-content">
        <div className="alert-box alert-error">{error || 'Order not found'}</div>
        <Link to="/" className="btn btn-secondary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <CheckCircle size={36} color="var(--accent-success)" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Thank you for shopping at BookStore. Your order has been registered and is being prepared.
        </p>

        {/* Order Details box */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ORDER NUMBER</span>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{order.orderID}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ORDER DATE</span>
              <span style={{ fontWeight: '500', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--text-muted)" />
                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {order.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.bookId?.title || 'Unknown Book Title'} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                  <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0px 6px', marginLeft: '6px' }}>{item.format.toUpperCase()}</span>
                </span>
                <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '800',
              fontSize: '1.15rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1rem',
              marginTop: '1.25rem',
            }}
          >
            <span>Total Price</span>
            <span style={{ color: 'var(--accent-primary)' }}>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
          <Link to="/orders" className="btn btn-primary">
            <ShieldCheck size={16} />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderConfirmation;
