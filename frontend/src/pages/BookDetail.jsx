import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_BASE, user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Checkout Form fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/books/${id}`);
        setBook(res.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, API_BASE]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!user) {
      navigate('/login?role=user');
      return;
    }

    if (!customerName || !address) {
      setCheckoutError('Please fill in all fields.');
      return;
    }

    setPurchasing(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.post(`${API_BASE}/users/orders`, {
        bookId: book._id,
        customerName,
        address,
        price: book.price
      }, config);

      navigate('/my-orders');
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err.response?.data?.message || 'Error processing purchase.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-brown" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container my-5 text-center text-muted">
        Book not found.
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Cover Image */}
      <div className="book-detail-cover-container">
        {book.image ? (
          <img
            src={`http://127.0.0.1:8000/uploads/${book.image}`}
            alt={book.title}
            className="book-detail-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.parentNode.innerHTML = '<div class="book-detail-cover bg-secondary text-white d-flex justify-content-center align-items-center" style={{width: 320, height: 420}}><span class="fs-1">📖</span></div>';
            }}
          />
        ) : (
          <div className="book-detail-cover bg-secondary text-white d-flex justify-content-center align-items-center" style={{ width: 320, height: 420 }}>
            <span className="fs-1">📖</span>
          </div>
        )}
      </div>

      {/* Detail Split Cards */}
      <div className="book-detail-cards">
        <div className="book-detail-card">
          <h4>Description</h4>
          <p style={{ lineHeight: '1.7', color: '#553E32' }}>{book.description}</p>
        </div>

        <div className="book-detail-card">
          <h4>Info</h4>
          <div className="mb-2">
            <strong>Title:</strong> {book.title}
          </div>
          <div className="mb-2">
            <strong>Author:</strong> {book.author}
          </div>
          <div className="mb-2">
            <strong>Genre:</strong> {book.genre}
          </div>
          <div className="mb-2">
            <strong>Price:</strong> ₹{book.price}
          </div>
          <div className="mb-2">
            <strong>Seller:</strong> {book.sellerName || 'Pravanshu'}
          </div>
          <div className="mb-2">
            <strong>Availability:</strong> {book.quantity > 0 ? `${book.quantity} copies in stock` : <span className="text-danger">Out of stock</span>}
          </div>
        </div>
      </div>

      {/* Buy Now Button */}
      <div className="text-center">
        {book.quantity > 0 ? (
          <button
            onClick={() => {
              if (!user) {
                navigate('/login?role=user');
              } else {
                setShowCheckout(true);
              }
            }}
            className="btn btn-brown px-5 py-2 fs-5"
          >
            Buy Now
          </button>
        ) : (
          <button className="btn btn-secondary px-5 py-2 fs-5" disabled>
            Out of Stock
          </button>
        )}
      </div>

      {/* Checkout Overlay Modal */}
      {showCheckout && (
        <div className="custom-modal-overlay">
          <div className="auth-card" style={{ maxWidth: '500px' }}>
            <h3 className="text-center mb-4" style={{ color: '#7D4016' }}>Secure Checkout</h3>
            
            {checkoutError && (
              <div className="alert alert-danger text-center p-2" style={{ fontSize: '0.9rem' }}>
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit}>
              <div className="mb-3">
                <label className="form-label form-label-custom">Customer Name</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label form-label-custom">Shipping Address</label>
                <textarea
                  className="form-control form-control-custom"
                  rows="3"
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="btn btn-secondary w-50 py-2 fw-bold"
                  disabled={purchasing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-brown w-50 py-2"
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
