import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { StudentLoginPage } from './components/StudentLoginPage';
import { StudentSignupPage } from './components/StudentSignupPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { authService } from './services/authService';
import type { User } from './types/User';
import './App.css';

// Lazy-load heavy page components to reduce initial bundle size
const LandingPage = lazy(() => import('./components/LandingPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));

// Shared loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center space-y-4">
      <div
        className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}
      />
      <p style={{ color: 'var(--text-muted)' }} className="text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const currentUser = authService.getCurrentUser();
      const accessToken = authService.getAccessToken();

      if (currentUser && accessToken) {
        // Validate token expiry
        if (authService.isTokenValid()) {
          setUser(currentUser);
        } else {
          // Try to refresh token
          try {
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              const refreshResponse = await authService.axiosInstance.post('/auth/refresh', {
                refreshToken,
              });
              const refreshData = refreshResponse.data;

              if (refreshData.success) {
                // Update tokens and set user
                localStorage.setItem('accessToken', refreshData.accessToken);
                localStorage.setItem('refreshToken', refreshData.refreshToken);
                setUser(currentUser);
              } else {
                // Refresh failed, logout
                await authService.logout();
              }
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            await authService.logout();
          }
        }
      }
      setLoading(false);
    };

    validateAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center space-y-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">Loading DigiMess...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing page — entry point */}
        <Route
          path="/"
          element={<LandingPage user={user} onLogout={handleLogout} />}
        />
        {/* Login routes */}
        <Route
          path="/login"
          element={
            user ?
            <Navigate to="/dashboard" /> :
            <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/forgot-password"
          element={
            user ?
            <Navigate to="/dashboard" /> :
            <ForgotPasswordPage />
          }
        />
        <Route
          path="/reset-password"
          element={
            user ?
            <Navigate to="/dashboard" /> :
            <ResetPasswordPage />
          }
        />
        <Route
          path="/student/login"
          element={
            user ?
            <Navigate to="/dashboard" /> :
            <StudentLoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/student/signup"
          element={
            user ?
            <Navigate to="/dashboard" /> :
            <StudentSignupPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            !user ?
            <Navigate to="/" /> :
            (user.role === 'admin' ?
              <div className="h-screen w-screen flex flex-col">
                <AdminDashboard user={user} onLogout={handleLogout} />
              </div> :
              <div className="h-screen w-screen flex flex-col">
                <StudentDashboard user={user} onLogout={handleLogout} />
              </div>
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
