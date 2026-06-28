import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { Search } from 'lucide-react';

const Home = () => {
  const { apiCall } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // Static categories for filtering chips
  const genres = ['All', 'Fiction', 'Non-Fiction', 'Science', 'Romance', 'Children'];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
      if (selectedGenre && selectedGenre !== 'All') {
        queryParams.push(`genre=${encodeURIComponent(selectedGenre)}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const data = await apiCall(`/books${queryString}`);
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch books. Ensure server is running.');
      console.error(err);
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

  return (
    <div className="main-content">
      {/* Hero Banner */}
      <section className="hero">
        <h1>Find Your Next Great Read</h1>
        <p>
          Welcome to BookStore – your one-stop destination for all things books! 
          Explore our vast collections, track your reading progress, and secure your favorites in just a few clicks.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by title, author, description..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </section>

      {/* Category Selection Filter Chips */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Filter by Genre</h2>
        <div className="category-container">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g === 'All' ? '' : g)}
              className={`category-chip ${((g === 'All' && !selectedGenre) || selectedGenre === g) ? 'active' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Book Catalog Grid */}
      <div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : error ? (
          <div className="alert-box alert-error">{error}</div>
        ) : books.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
            <h3>No books found</h3>
            <p style={{ marginTop: '0.5rem' }}>Try modifying your search queries or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Home;
