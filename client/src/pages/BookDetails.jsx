import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import { ShoppingCart, Star, MapPin, Layers, Award, Tag } from 'lucide-react';

const BookDetails = () => {
  const { id } = useParams();
  const { apiCall } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('paperback');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const fetchBookDetails = async () => {
    try {
      const data = await apiCall(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setError('Failed to load book details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, quantity, format);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 4000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="main-content">
        <div className="alert-box alert-error">{error || 'Book not found'}</div>
        <Link to="/" className="btn btn-secondary">Back to Catalog</Link>
      </div>
    );
  }

  const { title, description, price, availabilityStatus, authors, genres, inventory, rating, reviewCount } = book;
  const authorNames = authors && authors.length > 0 ? authors.map(a => a.name).join(', ') : 'Unknown Author';
  const isOutOfStock = availabilityStatus === 'out-of-stock';

  return (
    <div className="main-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Browse</Link>
      </div>

      {addedMessage && (
        <div className="alert-box alert-success" style={{ animation: 'slideIn 0.3s ease-out' }}>
          <span>Successfully added item to shopping cart!</span>
          <Link to="/cart" style={{ textDecoration: 'underline', marginLeft: 'auto', fontWeight: '600' }}>View Cart &rarr;</Link>
        </div>
      )}

      {/* Grid Layout: Book metadata and purchases */}
      <div className="grid grid-cols-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
        <div>
          <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              {genres && genres.map(g => (
                <span key={g._id} className="badge badge-info" style={{ marginRight: '6px' }}>
                  {g.name}
                </span>
              ))}
              <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-success'}`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '0.5rem' }}>{title}</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
              By {authorNames}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#fbbf24' }}>
              <Star size={18} fill={rating > 0 ? '#fbbf24' : 'none'} stroke="#fbbf24" />
              <span style={{ fontWeight: '500' }}>{rating > 0 ? `${rating} stars (${reviewCount} ratings)` : 'No ratings yet'}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Synopsis</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{description}</p>
            </div>
          </div>
        </div>

        {/* Purchase Pane & Inventory info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem' }}>Buy Book Copy</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Price</span>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>${price.toFixed(2)}</span>
            </div>

            {/* Formats Selection */}
            <div className="form-group">
              <label className="form-label">Available Formats</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  onClick={() => setFormat('paperback')}
                  className={`btn ${format === 'paperback' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.85rem' }}
                  disabled={isOutOfStock}
                >
                  Paperback
                </button>
                <button
                  onClick={() => setFormat('ebook')}
                  className={`btn ${format === 'ebook' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.85rem' }}
                >
                  eBook (Digital)
                </button>
                <button
                  onClick={() => setFormat('special')}
                  className={`btn ${format === 'special' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.85rem' }}
                  disabled={isOutOfStock}
                >
                  Special Ed.
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                disabled={isOutOfStock && format !== 'ebook'}
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem' }}
              disabled={isOutOfStock && format !== 'ebook'}
            >
              <ShoppingCart size={18} />
              <span>Add to Shopping Cart</span>
            </button>
          </div>

          {/* One-to-Many: Inventory Listing details */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={18} color="var(--accent-primary)" />
              <span>Stock Details & Warehouses</span>
            </h3>

            {inventory && inventory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {inventory.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>{inv.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <Award size={12} color="var(--accent-secondary)" />
                        <span>Condition: {inv.condition.toUpperCase()}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.1rem', color: inv.quantity > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {inv.quantity}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>available</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No inventory tracking records configured for this book catalog listing.</p>
            )}
          </div>
        </div>
      </div>

      {/* Review Section */}
      <ReviewSection bookId={id} onInteractionUpdate={fetchBookDetails} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BookDetails;
