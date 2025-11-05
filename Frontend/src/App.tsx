import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { StudentLoginPage } from './components/StudentLoginPage';
import { StudentSignupPage } from './components/StudentSignupPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { AdminDashboard } from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import { authService } from './services/authService';
import type { User } from './types/User';
import './App.css';

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
              const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              const refreshData = await refreshResponse.json();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
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
          <StudentSignupPage />
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
  );
}

export default App;
