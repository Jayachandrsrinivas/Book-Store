import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Check, X, ShieldAlert, Award, MapPin } from 'lucide-react';

const SellerDashboard = () => {
  const { apiCall } = useAuth();
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab state: 'stats' | 'books' | 'orders'
  const [activeTab, setActiveTab] = useState('stats');

  // Modal / Form state for Add/Edit Book
  const [showModal, setShowModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(9.99);
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [genreName, setGenreName] = useState('Fiction');
  const [stockQuantity, setStockQuantity] = useState(10);
  const [stockLocation, setStockLocation] = useState('Main Warehouse');
  const [stockCondition, setStockCondition] = useState('new');

  const fetchData = async () => {
    try {
      // 1. Fetch dashboard stats
      const statsData = await apiCall('/seller/dashboard');
      setStats(statsData);

      // 2. Fetch all books (filter by seller context is handled in our backend, but let's query all books and filter locally to display the seller's catalog)
      const booksData = await apiCall('/books');
      setBooks(booksData);

      // 3. Fetch seller specific orders
      const ordersData = await apiCall('/seller/orders');
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to fetch seller dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setTitle('');
    setDescription('');
    setPrice(9.99);
    setAuthorName('');
    setAuthorBio('');
    setGenreName('Fiction');
    setStockQuantity(10);
    setStockLocation('Main Warehouse');
    setStockCondition('new');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBookId(book._id);
    setTitle(book.title);
    setDescription(book.description);
    setPrice(book.price);
    setAuthorName(book.authors && book.authors.length > 0 ? book.authors[0].name : '');
    setAuthorBio(book.authors && book.authors.length > 0 ? book.authors[0].bio || '' : '');
    setGenreName(book.genres && book.genres.length > 0 ? book.genres[0].name : 'Fiction');
    
    // Inventory copy
    const inv = book.inventory && book.inventory.length > 0 ? book.inventory[0] : null;
    setStockQuantity(inv ? inv.quantity : 0);
    setStockLocation(inv ? inv.location : 'Main Warehouse');
    setStockCondition(inv ? inv.condition : 'new');
    
    setError('');
    setShowModal(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      title,
      description,
      price: parseFloat(price),
      authors: [{ name: authorName, bio: authorBio }],
      genres: [genreName],
      inventory: {
        quantity: parseInt(stockQuantity),
        location: stockLocation,
        condition: stockCondition
      }
    };

    try {
      if (editingBookId) {
        await apiCall(`/books/${editingBookId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccess('Book updated successfully!');
      } else {
        await apiCall('/books', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccess('Book listed successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book listing? This removes all associated records.')) return;
    setError('');
    setSuccess('');
    try {
      await apiCall(`/books/${bookId}`, { method: 'DELETE' });
      setSuccess('Book deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete book');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await apiCall(`/seller/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setSuccess(`Order status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
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
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Seller Hub</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your publications, warehouses, and ship client purchases.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Book</span>
        </button>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'stats' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'stats' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'books' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'books' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          My Listed Books
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className="btn"
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'orders' ? '2px solid var(--accent-primary)' : 'none', borderRadius: 0, padding: '0.5rem 1rem', color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Order Fulfillment ({orders.length})
        </button>
      </div>

      {/* Tab Contents: Overview */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="grid grid-cols-4">
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TOTAL REVENUE</span>
              <div className="stat-val">${stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>COPIES SOLD</span>
              <div className="stat-val">{stats.itemsSold}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>BOOKS LISTED</span>
              <div className="stat-val">{stats.bookCount}</div>
            </div>
            <div className="glass-card stat-card">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>TOTAL STOCK</span>
              <div className="stat-val">{stats.totalStock}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Business Profile Summary</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back to BookStore portal. You are logged in as a registered partner publisher. 
              Keep your inventory updated regularly to avoid shipping delays.
            </p>
          </div>
        </div>
      )}

      {/* Tab Contents: My Listed Books */}
      {activeTab === 'books' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Total Stock</th>
                <th>Warehouse / Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No books listed yet. Add one above!</td>
                </tr>
              ) : (
                books.map((book) => {
                  const authorStr = book.authors?.map(a => a.name).join(', ') || 'Unknown';
                  const genreStr = book.genres?.map(g => g.name).join(', ') || 'None';
                  const totalQty = book.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
                  const firstLocation = book.inventory && book.inventory.length > 0 ? book.inventory[0].location : 'Unknown';

                  return (
                    <tr key={book._id}>
                      <td style={{ fontWeight: '600' }}>{book.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{authorStr}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{genreStr}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>${book.price.toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: totalQty > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {totalQty}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          <span>{firstLocation}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditModal(book)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteBook(book._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-danger)' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Contents: Order Fulfillment */}
      {activeTab === 'orders' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products Sold</th>
                <th>Fulfillment Cost</th>
                <th>Date</th>
                <th>Delivery Status</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No purchases placed for your publications yet.</td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const itemsStr = ord.items.map(i => `${i.bookId?.title || 'Book'} (${i.format.toUpperCase()} x${i.quantity})`).join(', ');
                  const orderRevenue = ord.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

                  return (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: '700' }}>{ord.orderID}</td>
                      <td>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{ord.userId?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.userId?.email}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsStr}>
                        {itemsStr}
                      </td>
                      <td style={{ fontWeight: '600' }}>${orderRevenue.toFixed(2)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          ord.status === 'delivered' ? 'badge-success' :
                          ord.status === 'shipped' ? 'badge-info' :
                          ord.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="form-control"
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          style={{ width: 'auto', display: 'inline-block', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', background: 'var(--bg-secondary)', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                {editingBookId ? 'Edit Book Listing' : 'List New Publication'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input type="text" required className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Great Gatsby" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Author Name</label>
                  <input type="text" required className="form-control" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="e.g. F. Scott Fitzgerald" />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Genre</label>
                  <select className="form-control" value={genreName} onChange={(e) => setGenreName(e.target.value)}>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science</option>
                    <option value="Romance">Romance</option>
                    <option value="Children">Children</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Author Bio (Optional)</label>
                <input type="text" className="form-control" value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} placeholder="Brief biographical detail of writer..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="form-label">Retail Price ($)</label>
                  <input type="number" step="0.01" min="0" required className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" min="0" required className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Stock Location (Warehouse)</label>
                  <input type="text" required className="form-control" value={stockLocation} onChange={(e) => setStockLocation(e.target.value)} placeholder="e.g. Warehouse 3B" />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Copy Condition</label>
                  <select className="form-control" value={stockCondition} onChange={(e) => setStockCondition(e.target.value)}>
                    <option value="new">New</option>
                    <option value="used">Used / Second-Hand</option>
                    <option value="damaged">Damaged / Clearance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Book Synopsis / Description</label>
                <textarea required className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed book synopsis..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Book Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SellerDashboard;
