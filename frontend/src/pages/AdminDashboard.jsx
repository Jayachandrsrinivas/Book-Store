import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrderModal from '../components/OrderModal';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { API_BASE, user } = useAuth();

  const path = location.pathname; // '/admin-home', '/admin-users', '/admin-sellers'

  // Summary Metrics State
  const [stats, setStats] = useState({ users: 0, vendors: 0, items: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  // Users List State
  const [usersList, setUsersList] = useState([]);
  
  // Sellers List State
  const [sellersList, setSellersList] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrders, setModalOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Feedback Messages
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE}/admin/stats`, config);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE}/admin/users`, config);
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSellers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE}/admin/sellers`, config);
      setSellersList(res.data);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (user) {
      await fetchStats();
      if (path === '/admin-users') await fetchUsers();
      if (path === '/admin-sellers') await fetchSellers();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [path, user]);

  // Approve Vendor/Seller
  const handleApproveSeller = async (sellerId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/admin/sellers/approve/${sellerId}`, {}, config);
      setMessage('Seller approved successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchSellers();
      fetchStats();
    } catch (err) {
      console.error('Error approving seller:', err);
    }
  };

  // Delete Seller
  const handleDeleteSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to delete this seller? This will also remove their books.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE}/admin/sellers/${sellerId}`, config);
      setMessage('Seller deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchSellers();
      fetchStats();
    } catch (err) {
      console.error('Error deleting seller:', err);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE}/admin/users/${userId}`, config);
      setMessage('User deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Edit User details inline/prompt
  const handleEditUser = async (u) => {
    const newName = window.prompt('Edit Name:', u.name);
    const newEmail = window.prompt('Edit Email:', u.email);
    if (newName === null || newEmail === null) return;
    if (!newName || !newEmail) {
      alert('Fields cannot be empty.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/admin/users/${u._id}`, { name: newName, email: newEmail }, config);
      setMessage('User updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      console.error('Error editing user:', err);
    }
  };

  // View User Orders in Modal
  const handleViewOrders = async (u) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE}/admin/user-orders/${u._id}`, config);
      setSelectedUser(u);
      setModalOrders(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

  // Delete Order inside Modal
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete/cancel this order?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE}/admin/orders/${orderId}`, config);
      
      // Update local modal list
      setModalOrders(modalOrders.filter(o => o._id !== orderId));
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // Render Charts and Cards (Admin Home)
  const renderDashboardHome = () => {
    const maxVal = Math.max(stats.users, stats.vendors, stats.items, stats.orders, 3);
    const usersHeight = (stats.users / maxVal) * 200;
    const vendorsHeight = (stats.vendors / maxVal) * 200;
    const itemsHeight = (stats.items / maxVal) * 200;
    const ordersHeight = (stats.orders / maxVal) * 200;

    return (
      <div className="dashboard-container">
        {/* Metric Cards Grid */}
        <div className="metric-card-grid">
          <div className="metric-card brown-card-1">
            <div className="metric-title">USERS</div>
            <div className="metric-value">{stats.users}</div>
          </div>
          <div className="metric-card green-card">
            <div className="metric-title">Vendors</div>
            <div className="metric-value">{stats.vendors}</div>
          </div>
          <div className="metric-card brown-card-2">
            <div className="metric-title">Items</div>
            <div className="metric-value">{stats.items}</div>
          </div>
          <div className="metric-card beige-card">
            <div className="metric-title">Total Orders</div>
            <div className="metric-value">{stats.orders}</div>
          </div>
        </div>

        {/* SVG vertical Bar Chart */}
        <div className="text-center mt-5">
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div className="chart-container">
              {/* Y Axis ticks */}
              <div className="chart-axis-y">
                <span>{maxVal}</span>
                <span>{Math.round((maxVal * 0.75) * 100) / 100}</span>
                <span>{Math.round((maxVal * 0.5) * 100) / 100}</span>
                <span>{Math.round((maxVal * 0.25) * 100) / 100}</span>
                <span>0</span>
              </div>

              {/* Users Bar (Purple) */}
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar users-bar"
                  style={{ height: `${usersHeight}px`, backgroundColor: '#2F1F4D' }}
                  title={`Users: ${stats.users}`}
                ></div>
                <span className="chart-label">Users</span>
              </div>

              {/* Vendors Bar (Cyan) */}
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar vendors-bar"
                  style={{ height: `${vendorsHeight}px`, backgroundColor: '#00FFFF' }}
                  title={`Vendors: ${stats.vendors}`}
                ></div>
                <span className="chart-label">Vendors</span>
              </div>

              {/* Items Bar (Blue) */}
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar items-bar"
                  style={{ height: `${itemsHeight}px`, backgroundColor: '#0000FF' }}
                  title={`Items: ${stats.items}`}
                ></div>
                <span className="chart-label">Items</span>
              </div>

              {/* Orders Bar (Orange) */}
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar orders-bar"
                  style={{ height: `${ordersHeight}px`, backgroundColor: '#FFA500' }}
                  title={`Orders: ${stats.orders}`}
                ></div>
                <span className="chart-label">Orders</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#804000' }}></div>
              <span>value</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Users Table
  const renderUsersTable = () => (
    <div className="table-responsive bg-white rounded border p-3 shadow-sm">
      <table className="table table-custom mb-0">
        <thead>
          <tr>
            <th>Sl/No</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {usersList.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">No users found.</td>
            </tr>
          ) : (
            usersList.map((u, idx) => (
              <tr key={u._id}>
                <td>{idx + 1}</td>
                <td>{u._id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <button onClick={() => handleEditUser(u)} className="btn btn-link text-success p-0" title="Edit User">
                      <i className="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button onClick={() => handleDeleteUser(u._id)} className="btn btn-link text-danger p-0" title="Delete User">
                      <i className="bi bi-trash3-fill fs-5"></i>
                    </button>
                    <button onClick={() => handleViewOrders(u)} className="btn btn-brown px-3 py-1 btn-sm rounded-1">
                      View Orders
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render Sellers Table
  const renderSellersTable = () => (
    <div className="table-responsive bg-white rounded border p-3 shadow-sm">
      <table className="table table-custom mb-0">
        <thead>
          <tr>
            <th>Sl/No</th>
            <th>Seller ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Approval</th>
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {sellersList.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted">No sellers found.</td>
            </tr>
          ) : (
            sellersList.map((s, idx) => (
              <tr key={s._id}>
                <td>{idx + 1}</td>
                <td>{s._id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  {s.isApproved ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending</span>
                  )}
                </td>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    {!s.isApproved && (
                      <button onClick={() => handleApproveSeller(s._id)} className="btn btn-green btn-sm px-3 py-1 rounded-1">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDeleteSeller(s._id)} className="btn btn-link text-danger p-0" title="Delete Seller">
                      <i className="bi bi-trash3-fill fs-5"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container my-5">
      <h2 className="dashboard-title">
        {path === '/admin-home' && 'Admin Dashboard'}
        {path === '/admin-users' && 'Users'}
        {path === '/admin-sellers' && 'Sellers'}
      </h2>

      {message && <div className="alert alert-success text-center">{message}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-brown" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div>
          {path === '/admin-home' && renderDashboardHome()}
          {path === '/admin-users' && renderUsersTable()}
          {path === '/admin-sellers' && renderSellersTable()}
        </div>
      )}

      {/* View Orders Overlay Modal */}
      <OrderModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        orders={modalOrders}
        userName={selectedUser?.name}
        onDeleteOrder={handleDeleteOrder}
      />
    </div>
  );
};

export default AdminDashboard;
