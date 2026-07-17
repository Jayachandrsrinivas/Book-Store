import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartExploring = () => {
    if (user) {
      if (user.role === 'user') navigate('/books');
      else if (user.role === 'seller') navigate('/seller-home');
      else navigate('/admin-home');
    } else {
      navigate('/login?role=user');
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (user && user.role === 'user') {
      navigate(`/books?genre=${encodeURIComponent(categoryName)}`);
    } else if (user) {
      // Admin/seller dashboards
      handleStartExploring();
    } else {
      navigate('/login?role=user');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Your Gateway to Infinite Stories</h1>
        <p className="hero-desc">
          Discover captivating books, connect with passionate sellers, and fuel your love for
          reading — only at <strong>BookVerse</strong>.
        </p>
        <button onClick={handleStartExploring} className="btn-brown py-2 px-4 rounded-5 fs-5">
          Start Exploring
        </button>
      </div>

      {/* Explore by Category */}
      <div className="container my-5">
        <h2 className="text-center mb-5" style={{ color: '#7D4016', fontWeight: 'bold' }}>Explore by Category</h2>
        <div className="row g-4 justify-content-center">
          <div className="col-6 col-md-3">
            <div className="category-card" onClick={() => handleCategoryClick('Fiction')}>
              <div className="category-emoji">📖</div>
              <p className="category-name">Fiction</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="category-card" onClick={() => handleCategoryClick('Science')}>
              <div className="category-emoji">🔬</div>
              <p className="category-name">Science</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="category-card" onClick={() => handleCategoryClick('Biographies')}>
              <div className="category-emoji">👤</div>
              <p className="category-name">Biographies</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="category-card" onClick={() => handleCategoryClick('Children')}>
              <div className="category-emoji">👧</div>
              <p className="category-name">Children's Books</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-container mt-5">
        <button className="btn-brown px-4 py-2 mb-4" onClick={() => navigate('/login?role=user')}>
          Contact Us
        </button>
        <p className="footer-quote">
          "Embark on a literary journey with our book haven – where every page turns into an adventure!"
        </p>
        <p className="footer-call">
          📞 Call At: 127-865-586-67
        </p>
        <p className="footer-copyright">
          © 2025 BookVerse. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Home;
