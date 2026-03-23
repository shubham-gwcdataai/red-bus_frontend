import React from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  Navigate, useLocation, useNavigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import SeatSelectionPage from '@/pages/SeatSelectionPage';
import BookingConfirmationPage from '@/pages/BookingConfirmationPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import AdminPage from '@/pages/AdminPage';

// ── Protected Route: must be logged in ───────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Save where user was trying to go so we can redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// ── Admin Route: must be logged in AND have role = 'admin' ────────
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // ✅ FIX: pass state.from = '/admin' so LoginPage redirects back here
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ✅ FIX: Check role from user object (cast to any to access role)
  const role = (user as any)?.role;
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const NO_FOOTER_PATHS = ['/login', '/signup', '/admin'];
const NO_NAV_PATHS = ['/admin'];

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.some(p => pathname.startsWith(p));
  const showNav = !NO_NAV_PATHS.some(p => pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-[#f5f7fa]">
      {showNav && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          {/* Protected (login required) */}
          <Route path="/seat-selection/:busId" element={
            <ProtectedRoute><SeatSelectionPage /></ProtectedRoute>
          } />
          <Route path="/booking/confirm" element={
            <ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin/*" element={
            <AdminRoute><AdminPage /></AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      {showNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <BookingProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
            error: { iconTheme: { primary: '#d63031', secondary: 'white' } },
          }}
        />
      </BookingProvider>
    </AuthProvider>
  </Router>
);

export default App;