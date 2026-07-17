import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const role = searchParams.get('role') || 'user'; // 'user', 'seller', 'admin'
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect them to their home page
    if (user) {
      if (user.role === 'user') navigate('/user-home');
      else if (user.role === 'seller') navigate('/seller-home');
      else if (user.role === 'admin') navigate('/admin-home');
    }
  }, [user, navigate]);

  // Reset messages when switching modes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMessage('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    if (isLogin) {
      const res = await login(email, password, role);
      if (res.success) {
        if (role === 'user') navigate('/user-home');
        else if (role === 'seller') navigate('/seller-home');
        else if (role === 'admin') navigate('/admin-home');
      } else {
        setError(res.message);
      }
    } else {
      const res = await register(name, email, password, role);
      if (res.success) {
        setMessage(res.message);
        if (role === 'user') {
          // Direct login for user
          setTimeout(() => navigate('/user-home'), 1500);
        } else {
          // Seller requires approval, so stay on page and prompt them
          setIsLogin(true);
        }
      } else {
        setError(res.message);
      }
    }
  };

  const getRoleLabel = () => {
    if (role === 'admin') return 'Admin';
    if (role === 'seller') return 'Seller';
    return 'User';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? `Login to ${getRoleLabel()} Account` : `${getRoleLabel()} Registration`}
        </h2>

        {error && <div className="alert alert-danger p-2 text-center" style={{ fontSize: '0.9rem' }}>{error}</div>}
        {message && <div className="alert alert-success p-2 text-center" style={{ fontSize: '0.9rem' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label form-label-custom">Name</label>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label form-label-custom">Email address</label>
            <input
              type="email"
              className="form-control form-control-custom"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label form-label-custom">Password</label>
            <input
              type="password"
              className="form-control form-control-custom"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-brown w-100 py-2 fs-5 mb-3">
            {isLogin ? 'Log in' : 'Signup'}
          </button>
        </form>

        <div className="text-center mt-3">
          {isLogin ? (
            <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
              {role === 'user' ? "Don't have an account? Create " : "Don't have an account? "}
              <span onClick={toggleMode} className="text-danger fw-bold cursor-pointer" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Signup
              </span>
            </p>
          ) : (
            <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <span onClick={toggleMode} className="text-danger fw-bold cursor-pointer" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
