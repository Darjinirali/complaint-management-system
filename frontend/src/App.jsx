import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User pages
import UserDashboard from './pages/user/Dashboard';
import SubmitComplaint from './pages/user/SubmitComplaint';
import MyComplaints from './pages/user/MyComplaints';
import ComplaintDetail from './pages/user/ComplaintDetail';

// Officer pages
import OfficerDashboard from './pages/officer/Dashboard';
import AssignedComplaints from './pages/officer/AssignedComplaints';
import OfficerComplaintDetail from './pages/officer/ComplaintDetail';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageUsers from './pages/admin/ManageUsers';
import AdminComplaintDetail from './pages/admin/ComplaintDetail';

// Shared layout
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'officer') return <Navigate to="/officer" replace />;
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f0f0f5',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00b894', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#e94560', secondary: '#1a1a2e' } },
          }}
        />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User routes */}
          <Route path="/user" element={
            <ProtectedRoute roles={['user']}>
              <Layout role="user" />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="submit" element={<SubmitComplaint />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
          </Route>

          {/* Officer routes */}
          <Route path="/officer" element={
            <ProtectedRoute roles={['officer']}>
              <Layout role="officer" />
            </ProtectedRoute>
          }>
            <Route index element={<OfficerDashboard />} />
            <Route path="complaints" element={<AssignedComplaints />} />
            <Route path="complaints/:id" element={<OfficerComplaintDetail />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;