import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserHome = () => {
  const navigate = useNavigate();
  const { API_BASE, user } = useAuth();
  
  const [bestSellers, setBestSellers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/books`);
        const allBooks = res.data;
        
        // Filter best sellers and recommendations matching screenshots
        const bestSellerTitles = ['Rich Dad Poor Dad', 'Think and Grow Rich', "Don't Let Her Stay", 'Killing the Witches'];
        const bs = allBooks.filter(b => bestSellerTitles.includes(b.title));
        
        const recTitles = ['The Alchemist', 'Atomic Habits'];
        const recs = allBooks.filter(b => recTitles.includes(b.title));

        setBestSellers(bs.length > 0 ? bs : allBooks.slice(0, 4));
        setRecommendations(recs.length > 0 ? recs : allBooks.slice(4, 8));
      } catch (error) {
        console.error('Error fetching home page books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [API_BASE]);

  return (
    <div className="container my-5">
      {/* Best Seller Section */}
      <div className="mb-5">
        <h2 className="text-center font-serif mb-4" style={{ fontSize: '2.4rem', color: '#7D4016' }}>Best Seller</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-brown" role="status"></div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {bestSellers.map((book) => (
              <div key={book._id} className="col-6 col-md-3">
                <div
                  className="card h-100 border-0 bg-transparent text-center cursor-pointer"
                  onClick={() => navigate(`/books/${book._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="book-image-container shadow-sm mb-3" style={{ height: '240px' }}>
                    {book.image ? (
                      <img
                        src={`http://127.0.0.1:8000/uploads/${book.image}`}
                        alt={book.title}
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
                  <h5 className="book-title-custom mb-1" style={{ fontSize: '1.05rem' }}>{book.title.toUpperCase()}</h5>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Recommendation Section */}
      <div className="mb-5">
        <h2 className="text-center font-serif mb-4" style={{ fontSize: '2.4rem', color: '#7D4016' }}>Top Recommendation</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-brown" role="status"></div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {recommendations.map((book) => (
              <div key={book._id} className="col-6 col-md-3">
                <div
                  className="card h-100 border-0 bg-transparent text-center cursor-pointer"
                  onClick={() => navigate(`/books/${book._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="book-image-container shadow-sm mb-3" style={{ height: '240px' }}>
                    {book.image ? (
                      <img
                        src={`http://127.0.0.1:8000/uploads/${book.image}`}
                        alt={book.title}
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
                  <h5 className="book-title-custom mb-1" style={{ fontSize: '1.05rem' }}>{book.title.toUpperCase()}</h5>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
