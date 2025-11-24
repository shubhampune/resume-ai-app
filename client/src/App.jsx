import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Search, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadZone from './components/UploadZone';
import ChatSearch from './components/ChatSearch';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import './index.css';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

import logo from './assets/logo.png';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const profileRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box" style={{ backgroundColor: 'transparent', width: 'auto', height: 'auto' }}>
          <img src={logo} alt="ResumeAI Logo" style={{ height: '40px', width: 'auto' }} />
        </div>
      </div>

      <div className="sidebar-nav">
        <SidebarLink to="/" icon={Upload} label="Import Resume" />
        <SidebarLink to="/search" icon={Search} label="Candidate Search" />
        <SidebarLink to="/admin" icon={LayoutDashboard} label="Database" />
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-section" style={{ position: 'relative' }} ref={profileRef}>
          <div
            className="user-profile-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin
              </div>
            </div>
          </div>

          {showProfileMenu && (
            <div className="profile-menu" style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E7EB',
              marginBottom: '0.5rem',
              overflow: 'hidden',
              zIndex: 50
            }}>
              <Link
                to="/settings"
                className="menu-item"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                <Settings size={18} />
                <span style={{ fontSize: '0.875rem' }}>Settings</span>
              </Link>
              <button
                onClick={logout}
                className="menu-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  textAlign: 'left'
                }}
              >
                <LogOut size={18} />
                <span style={{ fontSize: '0.875rem' }}>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <UploadZone />
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <ChatSearch />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
