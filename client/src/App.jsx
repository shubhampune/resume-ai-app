import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Search, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadZone from './components/UploadZone';
import ChatSearch from './components/ChatSearch';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import DocumentationPage from './components/DocumentationPage';
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
        <SidebarLink to="/search" icon={Search} label="Candidate Search" />
        <SidebarLink to="/admin" icon={LayoutDashboard} label="Database" />
        <SidebarLink to="/upload" icon={Upload} label="Import Resume" />
        <SidebarLink to="/documentation" icon={FileText} label="Documentation" />
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
              backgroundColor: '#2d4899',
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

      {/* WhatsApp Help Button */}
      <a
        href="https://wa.me/917972609303?text=Hi, I need help with the Resume AI system"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          backgroundColor: '#4da83c',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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

          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadZone />
            </ProtectedRoute>
          } />

          <Route path="/documentation" element={
            <ProtectedRoute>
              <DocumentationPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          {/* Default redirect to search */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/search" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
