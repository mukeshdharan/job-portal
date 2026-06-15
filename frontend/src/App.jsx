import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import Profile from './pages/Profile';
import Applications from './pages/Applications';

// Dashboards
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import RecruiterDashboard from './pages/Dashboard/RecruiterDashboard';
import CandidateDashboard from './pages/Dashboard/CandidateDashboard';

// Dashboard Resolver: Directs logged-in users to the right dashboard
const DashboardResolver = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'candidate':
      return <CandidateDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Layout Pages */}
          <Route path="/" element={<Layout />}>
            {/* Public/General Pages */}
            <Route index element={<Home />} />
            <Route path="jobs/:id" element={<JobDetails />} />

            {/* Protected Dynamic Dashboard */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardResolver />
                </ProtectedRoute>
              }
            />

            {/* Profile Page */}
            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Post/Edit Job */}
            <Route
              path="jobs/new"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />

            {/* Applications review board */}
            <Route
              path="applications"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Applications />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
