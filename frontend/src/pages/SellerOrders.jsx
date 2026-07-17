import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerOrders = () => {
  const { API_BASE, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const res = await axios.get(`${API_BASE}/seller/orders`, config);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, API_BASE]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      await axios.put(`${API_BASE}/seller/orders/${orderId}/status`, { status: newStatus }, config);
      setMessage('Order status updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="container my-5">
      <h2 className="text-center font-serif mb-5" style={{ fontSize: '2.5rem', color: '#7D4016' }}>Orders</h2>

      {message && <div className="alert alert-success text-center">{message}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-brown" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No orders have been placed for your books yet.
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order._id} className="order-card-horizontal">
              <div className="order-img-container">
                {order.image ? (
                  <img
                    src={`http://127.0.0.1:8000/uploads/${order.image}`}
                    alt={order.productName}
                    className="book-cover-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = '<span class="fs-1">📖</span>';
                    }}
                  />
                ) : (
                  <span className="fs-1">📖</span>
                )}
              </div>

              <div className="order-details-grid align-items-center">
                <div className="order-detail-item">
                  <span className="order-detail-label">Product Name</span>
                  <span className="order-detail-value">{order.productName || 'Book'}</span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Order ID</span>
                  <span className="order-detail-value text-muted" style={{ fontSize: '0.85rem' }}>
                    {order._id}
                  </span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Customer Name</span>
                  <span className="order-detail-value">{order.customerName}</span>
                </div>

                <div className="order-detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="order-detail-label">Address</span>
                  <span className="order-detail-value" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                    {order.address}
                  </span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Booking Date</span>
                  <span className="order-detail-value">{formatDate(order.bookingDate)}</span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Delivery By</span>
                  <span className="order-detail-value">{formatDate(order.deliveryDate)}</span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Warranty</span>
                  <span className="order-detail-value">{order.warranty || '1 year'}</span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Price</span>
                  <span className="order-detail-value text-success fw-bold">
                    ₹{order.price}
                  </span>
                </div>

                <div className="order-detail-item">
                  <span className="order-detail-label">Status</span>
                  <span className={`order-detail-value mb-1 ${order.status === 'delivered' ? 'order-status-delivered' : 'order-status-ontheway'}`}>
                    {order.status}
                  </span>
                  
                  {/* Status update controller */}
                  <select
                    className="form-select form-select-sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                  >
                    <option value="pending">pending</option>
                    <option value="ontheway">ontheway</option>
                    <option value="delivered">delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
