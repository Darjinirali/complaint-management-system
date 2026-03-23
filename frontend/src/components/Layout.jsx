import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, PlusCircle, Users,
  ClipboardList, LogOut, Bell, Shield, UserCheck, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navConfig = {
  user: [
    { to: '/user', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/user/submit', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/user/complaints', label: 'My Complaints', icon: FileText },
  ],
  officer: [
    { to: '/officer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/officer/complaints', label: 'Assigned Complaints', icon: ClipboardList },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
  ],
};

const roleIcons = { user: FileText, officer: UserCheck, admin: Shield };

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const navItems = navConfig[role] || [];
  const RoleIcon = roleIcons[role] || FileText;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <RoleIcon size={18} color="white" />
            </div>
            <div>
              <div className="logo-text">Complaint<span>Desk</span></div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '-2px' }}>
                {role} panel
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="page-title">
            {navItems.find(n => window.location.pathname === n.to)?.label ||
             navItems.find(n => !n.end && window.location.pathname.startsWith(n.to))?.label ||
             'Dashboard'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex'
            }}>
              <Bell size={17} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px'
            }}>
              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{initials}</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}