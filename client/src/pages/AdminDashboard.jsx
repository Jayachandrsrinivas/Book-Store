import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Shield, User, Star, ToggleLeft, X } from 'lucide-react';

const AdminDashboard = () => {
  const { apiCall } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tabs: 'stats' | 'users' | 'reviews'
  const [activeTab, setActiveTab] = useState('stats');

  // Modal / User Form state
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [businessName, setBusinessName] = useState('');

  const fetchAdminData = async () => {
    try {
      // 1. Fetch overall admin stats
      const statsData = await apiCall('/admin/dashboard');
      setStats(statsData);

      // 2. Fetch all user accounts
      const usersData = await apiCall('/admin/users');
      setUsers(usersData);

      // 3. Fetch all reviews for moderation
      const reviewsData = await apiCall('/admin/reviews');
      setReviews(reviewsData);
    } catch (err) {
      setError('Failed to fetch admin dashboard configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setBusinessName('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUserId(u._id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setBusinessName(u.businessName || '');
    setError('');
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      email,
      role,
      businessName: role === 'seller' ? businessName : undefined,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editingUserId) {
        await apiCall(`/admin/users/${editingUserId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Account updated successfully!');
      } else {
        if (!password) {
          setError('Password is required for new accounts');
          return;
        }
        await apiCall('/admin/users', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password }),
        });
        setSuccess('Account created successfully!');
      }
      setShowModal(false);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to save account details');
    }
  };

  const handleDeleteUser = async (uId) => {
    if (!window.confirm('WARNING: Deleting this user cleans up all their orders, listed books, and review submissions. Proceed?')) return;
    setError('');
    setSuccess('');
    try {
      await apiCall(`/admin/users/${uId}`, { method: 'DELETE' });
      setSuccess('Account and associated items wiped successfully!');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteReview = async (revId) => {
    if (!window.confirm('Moderate Review: Are you sure you want to delete this rating comment from the catalog?')) return;
    setError('');
    setSuccess('');
    try {
      await apiCall(`/admin/reviews/${revId}`, { method: 'DELETE' });
      setSuccess('Review moderated and removed successfully!');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Moderation deletion failed');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={32} color="var(--accent-secondary)" />
            <span>Admin Control Panel</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Oversee system settings, user database records, seller approval lists, and moderate reviews.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Create Account</span>
        </button>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {/* Tab controls */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'stats' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'stats' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Manage Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'reviews' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Review Moderation Queue ({reviews.length})
        </button>
      </div>

      {/* Tab content: Stats Overview */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="grid grid-cols-4">
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TOTAL REVENUE</span>
              <div className="stat-val">${stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ORDERS COMPLETED</span>
              <div className="stat-val">{stats.orderCount}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>CATALOG TITLES</span>
              <div className="stat-val">{stats.bookCount}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PARTNERS & USERS</span>
              <div className="stat-val">{stats.userCount + stats.sellerCount}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Security & Platform Configurations</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              System is running securely in staging/sandbox. Mongoose middleware database listeners are actively tracking transactions. 
              As an Administrator, you can view user credentials, adjust roles, verify business names for sellers, and moderate comments.
            </p>
          </div>
        </div>
      )}

      {/* Tab content: User Management */}
      {activeTab === 'users' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Seller Business details</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: '600' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'admin' ? 'badge-danger' :
                      u.role === 'seller' ? 'badge-info' : 'badge-success'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {u.role === 'seller' ? (u.businessName || 'Unnamed Publisher') : 'N/A (Reader)'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEditModal(u)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab content: Review Moderation */}
      {activeTab === 'reviews' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Reading Progress</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No submitted review ratings found.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td style={{ fontWeight: '600' }}>{rev.bookId?.title || 'Unknown Title'}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{rev.userId?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', color: '#fbbf24' }}>
                        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                        <span>{rev.rating}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rev.reviewText}>
                      {rev.reviewText || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Empty text review</span>}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{rev.readingProgress}%</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteReview(rev._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-secondary)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                {editingUserId ? 'Edit Account Details' : 'Register New User'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" required className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">Reader / User</option>
                  <option value="seller">Seller / Partner</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {role === 'seller' && (
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input type="text" required className="form-control" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Password {editingUserId && '(Leave blank to keep unchanged)'}</label>
                <input type="password" required={!editingUserId} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;
