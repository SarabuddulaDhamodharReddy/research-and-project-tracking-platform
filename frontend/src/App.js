import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DashboardPage from './pages/DashboardPage';
import UploadProjectPage from './pages/UploadProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import CollaborationRequestsPage from './pages/CollaborationRequestsPage';
import AuthSuccess from "./pages/AuthSuccess";

// ✅ Redirects to /dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-ink-400">Loading...</span>
    </div>
  );
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ✅ Redirects to /login if not logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-ink-400">Loading...</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* ✅ Public routes - redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        {/* ✅ Must be before wildcard */}
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* ✅ Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadProjectPage /></ProtectedRoute>} />
        <Route path="/projects/:id/edit" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><CollaborationRequestsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;