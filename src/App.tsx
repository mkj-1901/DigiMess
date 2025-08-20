import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import { authService } from './services/authService';
import type { User } from './types/User';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'admin') {
    return(
      <div className="h-screen w-screen flex flex-col">
        <AdminDashboard user={user} onLogout={handleLogout} />
      </div>
    );
  } else {
    return (
      <div className="h-screen w-screen flex flex-col">
        <StudentDashboard user={user} onLogout={handleLogout} />
      </div>
    );
  }
}

export default App;
