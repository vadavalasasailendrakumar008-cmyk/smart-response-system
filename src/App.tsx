import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DemoRoleSwitcher } from './components/common/DemoRoleSwitcher';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { EmergencyReportPage } from './pages/EmergencyReportPage';
import { ResponderDashboard } from './pages/ResponderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { SafetyGuidancePage } from './pages/SafetyGuidancePage';
import { UserRole } from './shared/types';

// Route Guard Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        Authenticating RescuOS session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to their role home
    if (user.role === 'CITIZEN') return <Navigate to="/dashboard" replace />;
    if (user.role === 'RESPONDER') return <Navigate to="/responder" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 selection:bg-red-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/safety" element={<SafetyGuidancePage />} />

          {/* Authenticated Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <EmergencyReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/responder"
            element={
              <ProtectedRoute allowedRoles={['RESPONDER', 'ADMIN']}>
                <ResponderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <IncidentDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {/* Floating Sandbox / Demo Switcher Widget */}
      <DemoRoleSwitcher />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
