import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
  const { API_BASE, user } = useAuth();
  
  const [stats, setStats] = useState({ items: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const res = await axios.get(`${API_BASE}/seller/stats`, config);
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching seller stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, API_BASE]);

  // Calculate SVG bar heights (max value represents 100% of height = 200px)
  const maxVal = Math.max(stats.items, stats.orders, 2); // Default max is at least 2 for layout
  const itemsHeight = (stats.items / maxVal) * 200;
  const ordersHeight = (stats.orders / maxVal) * 200;

  return (
    <div className="container my-5">
      <h2 className="dashboard-title">Seller Dashboard</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-brown" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          {/* Summary Metric Cards */}
          <div className="row g-4 justify-content-center mb-5">
            <div className="col-12 col-md-5">
              <div className="metric-card brown-card-1">
                <div className="metric-title">Items</div>
                <div className="metric-value">{stats.items}</div>
              </div>
            </div>
            <div className="col-12 col-md-5">
              <div className="metric-card yellow-card">
                <div className="metric-title">Total Orders</div>
                <div className="metric-value">{stats.orders}</div>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="text-center mt-5">
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <div className="chart-container">
                {/* Y Axis ticks */}
                <div className="chart-axis-y">
                  <span>{maxVal}</span>
                  <span>{Math.round((maxVal * 0.75) * 10) / 10}</span>
                  <span>{Math.round((maxVal * 0.5) * 10) / 10}</span>
                  <span>{Math.round((maxVal * 0.25) * 10) / 10}</span>
                  <span>0</span>
                </div>

                {/* Items Bar */}
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar items-bar"
                    style={{ height: `${itemsHeight}px` }}
                    title={`Items: ${stats.items}`}
                  ></div>
                  <span className="chart-label">Items</span>
                </div>

                {/* Orders Bar */}
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar orders-bar"
                    style={{ height: `${ordersHeight}px` }}
                    title={`Orders: ${stats.orders}`}
                  ></div>
                  <span className="chart-label">Orders</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#0000FF' }}></div>
                <span>value</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
