import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
];

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your store' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/orders': { title: 'Orders', subtitle: 'Track and manage orders' },
  '/customers': { title: 'Customers', subtitle: 'View registered customers' },
};

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'Admin', subtitle: '' };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img src="/logo.png" alt="Ashirwaad Coating logo" />
          </div>
          <div className="sidebar-logo-text">
            <h2>Ashirwad Coating</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', padding: '0 4px' }}>
            Logged in as <strong style={{ color: 'var(--gold)' }}>{user?.name}</strong>
          </div>
          <button className="sidebar-link" onClick={onLogout} style={{ color: '#f87171' }}>
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.subtitle}</p>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
