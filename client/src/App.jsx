import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Search, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadZone from './components/UploadZone';
import ChatSearch from './components/ChatSearch';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
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

const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <FileText className="text-white" size={20} color="white" />
        </div>
        <span className="app-title">ResumeAI</span>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        <SidebarLink to="/" icon={Upload} label="Import Resume" />
        <SidebarLink to="/search" icon={Search} label="Candidate Search" />
        <SidebarLink to="/admin" icon={LayoutDashboard} label="Database" />

        <div className="nav-section-title">System</div>
        <SidebarLink to="#" icon={Settings} label="Settings" />
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', padding: '0 1rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
          Signed in as <br />
          <span style={{ color: 'white', fontWeight: '600' }}>{user?.name}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
