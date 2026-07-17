import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send, BookOpen } from 'lucide-react';

const ReviewSection = ({ bookId, onInteractionUpdate }) => {
  const { user, apiCall } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [progress, setProgress] = useState(0);

  const fetchReviews = async () => {
    try {
      const data = await apiCall(`/books/${bookId}/reviews`);
      setReviews(data);
      
      // If current user has a review/interaction, pre-populate form states
      if (user) {
        const userInteraction = data.find(r => r.userId?._id === user._id);
        if (userInteraction) {
          setRating(userInteraction.rating || 5);
          setReviewText(userInteraction.reviewText || '');
          setProgress(userInteraction.readingProgress || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId, user]);

  const handleSubmitInteraction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiCall(`/books/${bookId}/interact`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          reviewText,
          readingProgress: progress,
        }),
      });
      setSuccess('Your response has been saved!');
      fetchReviews();
      if (onInteractionUpdate) {
        onInteractionUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    }
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={26} color="var(--accent-primary)" />
        <span>Reviews & Progress</span>
      </h2>

      {user ? (
        <form onSubmit={handleSubmitInteraction} className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.25rem' }}>Your Reading Status & Review</h3>
          
          {error && <div className="alert-box alert-error">{error}</div>}
          {success && <div className="alert-box alert-success">{success}</div>}

          {/* Reading progress slider */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Reading Progress</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{progress}%</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BookOpen size={18} color="var(--text-secondary)" />
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {/* Rating selector */}
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Book Rating</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
                  >
                    <Star
                      size={28}
                      fill={star <= rating ? '#fbbf24' : 'none'}
                      stroke={star <= rating ? '#fbbf24' : '#64748b'}
                      transition="transform 0.2s"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review text */}
          <div className="form-group">
            <label className="form-label">Write a Review</label>
            <textarea
              className="form-control"
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <Send size={16} />
            <span>Save Interaction</span>
          </button>
        </form>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Please <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'underline' }}>Login</a> to track your reading progress and leave a review.
        </div>
      )}

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontWeight: '600' }}>{rev.userId?.name || 'Anonymous Reader'}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {rev.rating !== undefined && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.rating ? '#fbbf24' : 'none'}
                          stroke={star <= rev.rating ? '#fbbf24' : '#64748b'}
                        />
                      ))}
                    </div>
                  )}
                  {rev.readingProgress > 0 && (
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      Progress: {rev.readingProgress}%
                    </span>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{rev.reviewText || 'No review comment left.'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
