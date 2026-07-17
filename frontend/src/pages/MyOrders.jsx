import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const { API_BASE, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const res = await axios.get(`${API_BASE}/users/orders`, config);
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, API_BASE]);

  // Formats Dates to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="container-fluid px-0">
      <div className="container my-5" style={{ minHeight: '50vh' }}>
        <h2 className="text-center font-serif mb-5" style={{ fontSize: '2.5rem', color: '#7D4016' }}>My Orders</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-brown" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span className="fs-1 d-block mb-3">📦</span>
            You have not placed any orders yet.
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

                <div className="order-details-grid">
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

                  <div className="order-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="order-detail-label">Address</span>
                    <span className="order-detail-value" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                      {order.address}
                    </span>
                  </div>

                  <div className="order-detail-item">
                    <span className="order-detail-label">Seller</span>
                    <span className="order-detail-value">{order.sellerName || 'Pravanshu'}</span>
                  </div>

                  <div className="order-detail-item">
                    <span className="order-detail-label">Booking Date</span>
                    <span className="order-detail-value">{formatDate(order.bookingDate)}</span>
                  </div>

                  <div className="order-detail-item">
                    <span className="order-detail-label">Delivery By</span>
                    <span className="order-detail-value">{formatDate(order.deliveryDate)}</span>
                  </div>

                  <div className="order-detail-item text-md-end">
                    <span className="order-detail-label">Price</span>
                    <span className="order-detail-value text-success fw-bold" style={{ fontSize: '1.05rem' }}>
                      ₹{order.price}
                    </span>
                  </div>

                  <div className="order-detail-item text-md-end">
                    <span className="order-detail-label">Status</span>
                    <span className={`order-detail-value ${order.status === 'delivered' ? 'order-status-delivered' : 'order-status-ontheway'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="footer-container">
        <button className="btn-brown px-4 py-2 mb-4">
          Contact Us
        </button>
        <p className="footer-quote">
          "Embark on a literary journey with our book haven – where every page turns into an adventure!"
        </p>
        <p className="footer-call">
          📞 Call At: 127-865-586-67
        </p>
        <p className="footer-copyright">
          © 2025 BookVerse. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MyOrders;
