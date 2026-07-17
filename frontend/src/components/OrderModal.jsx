import React from 'react';

const OrderModal = ({ isOpen, onClose, orders, userName, onDeleteOrder }) => {
  if (!isOpen) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-card">
        <h3 className="custom-modal-title">User Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No orders found for this user.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card-horizontal">
              <div className="order-img-container">
                {order.image ? (
                  <img
                    src={`http://127.0.0.1:8000/uploads/${order.image}`}
                    alt={order.productName}
                    className="book-cover-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = '<span class="fs-1 text-muted">📖</span>';
                    }}
                  />
                ) : (
                  <span className="fs-1 text-muted">📖</span>
                )}
              </div>
              
              <div className="order-details-grid">
                <div className="order-detail-item">
                  <span className="order-detail-label">Product:</span>
                  <span className="order-detail-value">{order.productName || 'Book'}</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Order ID: {order._id.substring(0, 10)}</span>
                </div>
                
                <div className="order-detail-item">
                  <span className="order-detail-label">Buyer:</span>
                  <span className="order-detail-value">{order.customerName || userName}</span>
                  <span className="order-detail-label mt-1">Seller:</span>
                  <span className="order-detail-value">{order.sellerName || 'Pravanshu'}</span>
                </div>
                
                <div className="order-detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="order-detail-label">Address:</span>
                  <span className="order-detail-value" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                    {order.address}
                  </span>
                </div>
                
                <div className="order-detail-item text-md-end">
                  <span className="order-detail-label">Price:</span>
                  <span className="order-detail-value text-success" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    ₹{order.price}
                  </span>
                  <span className="order-detail-label mt-1">Status:</span>
                  <span className="order-detail-value text-primary" style={{ fontSize: '0.9rem' }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {onDeleteOrder && (
                <button
                  onClick={() => onDeleteOrder(order._id)}
                  className="btn btn-link text-danger ms-3 p-1"
                  title="Cancel Order"
                >
                  <i className="bi bi-trash3-fill fs-5"></i>
                </button>
              )}
            </div>
          ))
        )}

        <button onClick={onClose} className="custom-modal-close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderModal;
