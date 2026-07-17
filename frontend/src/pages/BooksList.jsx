import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BooksList = () => {
  const navigate = useNavigate();
  const { API_BASE, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const genres = ['All', 'Fiction', 'Science', 'Biographies', "Children's Books", 'Self-help'];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/users/books`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      
      // Standardize genre filtering
      let filterGenre = selectedGenre;
      if (selectedGenre === "Children's Books") filterGenre = 'Children';
      
      if (filterGenre && filterGenre !== 'All') {
        params.push(`genre=${encodeURIComponent(filterGenre)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await axios.get(url);
      setBooks(res.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  // Add item to local storage wishlist
  const handleAddToWishlist = (book) => {
    try {
      const storedWishlist = localStorage.getItem('bookverse_wishlist');
      const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      
      const isAlreadyIn = wishlist.some(item => item._id === book._id);
      if (isAlreadyIn) {
        setAlertMsg({ text: `"${book.title}" is already in your wishlist!`, type: 'warning' });
        setTimeout(() => setAlertMsg({ text: '', type: '' }), 3000);
        return;
      }

      wishlist.push(book);
      localStorage.setItem('bookverse_wishlist', JSON.stringify(wishlist));
      setAlertMsg({ text: `"${book.title}" added to your wishlist successfully!`, type: 'success' });
      setTimeout(() => setAlertMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error('Error modifying wishlist:', err);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center font-serif mb-4" style={{ fontSize: '2.5rem', color: '#7D4016' }}>Books List</h2>
      
      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} text-center`} role="alert">
          {alertMsg.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="row g-3 justify-content-between align-items-center mb-5 bg-white p-3 rounded shadow-sm border">
        <div className="col-12 col-md-4">
          <form onSubmit={handleSearchSubmit} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-brown" type="submit">Search</button>
          </form>
        </div>
        
        <div className="col-12 col-md-4">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-nowrap" style={{ color: '#7D4016' }}>Filter by Genre:</span>
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-brown" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No books found matching your query.
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
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
                  onClick={() => handleAddToWishlist(book)}
                  className="btn btn-brown flex-grow-1 py-1"
                  style={{ fontSize: '0.9rem' }}
                >
                  Wishlist
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

export default BooksList;
