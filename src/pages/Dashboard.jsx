import { useState, useEffect } from 'react';
import { getDashboardStats, seedProducts } from '../api';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await seedProducts();
      setSeedMsg(res.data.message);
      fetchStats();
    } catch (err) {
      setSeedMsg(err.response?.data?.message || 'Error seeding');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-gray)' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold"><DollarSign size={22} /></div>
          <div className="stat-info">
            <h3>${(stats?.totalRevenue || 0).toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><ShoppingCart size={22} /></div>
          <div className="stat-info">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Package size={22} /></div>
          <div className="stat-info">
            <h3>{stats?.totalProducts || 0}</h3>
            <p>Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <h3>{stats?.ordersByStatus?.length || 0}</h3>
            <p>Status Types</p>
          </div>
        </div>
      </div>

      {/* Seed Button */}
      {stats?.totalProducts === 0 && (
        <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)' }}>No Products Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--warm-gray)', marginTop: '4px' }}>Seed default products to get started quickly.</p>
          </div>
          <button className="btn btn-gold" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed 12 Products'}
          </button>
        </div>
      )}
      {seedMsg && (
        <div style={{ padding: '10px 14px', background: 'var(--green-light)', color: '#166534', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: 500 }}>
          {seedMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>Revenue (Last 7 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={stats?.dailyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--stone)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="var(--warm-gray)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--warm-gray)" />
                <Tooltip
                  contentStyle={{ background: 'var(--warm-white)', border: '1px solid var(--stone)', borderRadius: '10px', fontSize: '13px' }}
                />
                <Bar dataKey="revenue" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>Recent Orders</h3>
          {stats?.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentOrders.slice(0, 6).map((order) => (
                <div key={order._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--sand)' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--charcoal)' }}>
                      {order.orderNumber || order._id.slice(-8)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-gray)' }}>
                      {order.customerInfo?.name || 'Guest'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>${order.total?.toFixed(2)}</p>
                    <span className={`badge badge-${order.orderStatus}`}>{order.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--warm-gray)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>No orders yet</p>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      {stats?.ordersByStatus?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '16px' }}>Order Status Breakdown</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {stats.ordersByStatus.map((s) => (
              <div key={s._id} style={{ padding: '12px 20px', background: 'var(--sand)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)' }}>{s.count}</p>
                <p style={{ fontSize: '12px', color: 'var(--warm-gray)', textTransform: 'capitalize' }}>{s._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
