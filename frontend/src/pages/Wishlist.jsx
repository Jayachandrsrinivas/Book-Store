import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedWishlist = localStorage.getItem('bookverse_wishlist');
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  const handleRemoveFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(item => item._id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem('bookverse_wishlist', JSON.stringify(updatedWishlist));
  };

  return (
    <div className="container my-5">
      <h2 className="text-center font-serif mb-5" style={{ fontSize: '2.5rem', color: '#7D4016' }}>My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <span className="fs-1 d-block mb-3">🖤</span>
          Your wishlist is currently empty. Start exploring the store to add books!
        </div>
      ) : (
        <div className="books-grid">
          {wishlist.map((book) => (
            <div key={book._id} className="book-card">
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
              <p className="book-price-custom">₹{book.price}</p>
              
              <div className="d-flex gap-2 mt-auto">
                <button
                  onClick={() => handleRemoveFromWishlist(book._id)}
                  className="btn btn-red flex-grow-1 py-1"
                  style={{ fontSize: '0.9rem' }}
                >
                  Remove
                </button>
                <button
                  onClick={() => navigate(`/books/${book._id}`)}
                  className="btn btn-brown flex-grow-1 py-1"
                  style={{ fontSize: '0.9rem' }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
