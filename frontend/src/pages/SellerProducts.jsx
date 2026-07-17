import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerProducts = () => {
  const { API_BASE, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchMyBooks = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const res = await axios.get(`${API_BASE}/seller/books`, config);
      setBooks(res.data);
    } catch (error) {
      console.error('Error fetching seller books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBooks();
    }
  }, [user, API_BASE]);

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book listing?')) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      await axios.delete(`${API_BASE}/seller/books/${bookId}`, config);
      setMessage('Book deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      setBooks(books.filter(b => b._id !== bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book listing.');
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center font-serif mb-5" style={{ fontSize: '2.5rem', color: '#7D4016' }}>Books List</h2>

      {message && <div className="alert alert-success text-center">{message}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-brown" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-5 text-muted">
          You have not listed any books yet. Click "Add Books" to create a listing.
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <button
                onClick={() => handleDeleteBook(book._id)}
                className="trash-btn-top-right"
                title="Delete Listing"
              >
                <i className="bi bi-trash3-fill fs-6"></i>
              </button>

              <div className="book-image-container">
                {book.image ? (
                  <img
                    src={`http://127.0.0.1:8000/uploads/${book.image}`}
                    alt={book.title}
                    className="book-cover-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = '<span class="book-image-placeholder">📖</span>';
                    }}
                  />
                ) : (
                  <span className="book-image-placeholder">📖</span>
                )}
              </div>
              <h3 className="book-title-custom" title={book.title}>{book.title}</h3>
              <p className="book-author-custom">Author: {book.author}</p>
              <p className="book-genre-custom">Genre: {book.genre}</p>
              <p className="book-price-custom">Price: Rs {book.price}</p>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Description: {book.description.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
