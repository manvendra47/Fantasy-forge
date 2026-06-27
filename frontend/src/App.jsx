import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import GenerateStory from './pages/GenerateStory';
import WriteStory from './pages/WriteStory';
import StoryView from './pages/StoryView';
import Explore from './pages/Explore';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/auth" replace />;
}

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        color: 'var(--amethyst-light)',
        letterSpacing: '0.1em',
      }}>FantasyForge</div>
      <div className="spinner" style={{ width: '28px', height: '28px' }} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('ff_theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.dataset.theme = storedTheme;
    document.body.dataset.theme = storedTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    localStorage.setItem('ff_theme', nextTheme);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="app-shell" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="rune-bg" />
      {user && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />
          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/generate"
            element={<PrivateRoute><GenerateStory /></PrivateRoute>}
          />
          <Route
            path="/write"
            element={<PrivateRoute><WriteStory /></PrivateRoute>}
          />
          <Route
            path="/profile"
            element={<PrivateRoute><ProfilePage /></PrivateRoute>}
          />
          <Route
            path="/story/:id"
            element={<StoryView />}
          />
          <Route
            path="/explore"
            element={<Explore />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
          />
        </Routes>
      </div>
    </div>
  );
}
