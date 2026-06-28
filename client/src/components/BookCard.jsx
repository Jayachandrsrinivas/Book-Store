import React from 'react';
import { Link } from 'react-router-dom';
import { Star, User, BookOpen } from 'lucide-react';

const BookCard = ({ book }) => {
  const { _id, title, price, availabilityStatus, rating, reviewCount, authors, genres } = book;

  const authorNameStr = authors && authors.length > 0
    ? authors.map(a => a.name).join(', ')
    : 'Unknown Author';

  const isOutOfStock = availabilityStatus === 'out-of-stock';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Book Catalog Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-success'}`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#fbbf24' }}>
            <Star size={16} fill={rating > 0 ? '#fbbf24' : 'none'} stroke="#fbbf24" />
            <span>{rating > 0 ? `${rating} (${reviewCount})` : 'New'}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.3' }}>{title}</h3>
        
        <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          <User size={14} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {authorNameStr}
          </span>
        </p>

        {genres && genres.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
            {genres.map(g => (
              <span key={g._id} className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            ${price.toFixed(2)}
          </span>
          <Link to={`/books/${_id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <BookOpen size={14} />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
