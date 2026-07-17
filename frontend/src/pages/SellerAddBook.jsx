import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerAddBook = () => {
  const navigate = useNavigate();
  const { API_BASE, user } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!title || !author || !genre || !price || !description) {
      setError('Please fill in all text fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('genre', genre);
      formData.append('price', price);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.post(`${API_BASE}/seller/books`, formData, config);
      
      setMessage('Book listed successfully!');
      setTitle('');
      setAuthor('');
      setGenre('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      
      // Reset input element
      document.getElementById('itemImageInput').value = '';

      setTimeout(() => navigate('/my-products'), 1500);
    } catch (err) {
      console.error('Add book error:', err);
      setError(err.response?.data?.message || 'Error listing book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <h2 className="text-center font-serif mb-4" style={{ color: '#7D4016' }}>Add Book</h2>

          {error && <div className="alert alert-danger text-center p-2">{error}</div>}
          {message && <div className="alert alert-success text-center p-2">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-custom mb-0"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-custom mb-0"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-custom mb-0"
                placeholder="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="number"
                className="form-control form-control-custom mb-0"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <textarea
                className="form-control form-control-custom mb-0"
                placeholder="Description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label form-label-custom">Item Image</label>
              <input
                type="file"
                className="form-control form-control-custom mb-0"
                id="itemImageInput"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-brown w-100 py-2 fs-5"
              style={{ backgroundColor: '#8B6A4F' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerAddBook;
