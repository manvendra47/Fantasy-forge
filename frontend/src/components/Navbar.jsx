import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Compass, PlusCircle, LogOut, Menu, X, Feather, User, Sun, Moon } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'My Stories', icon: BookOpen },
  { path: '/explore', label: 'Explore', icon: Compass },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/generate', label: 'New Story', icon: PlusCircle, highlight: true },
];

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 8, 18, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Feather size={22} color="var(--ember)" />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
          }}>
            Fantasy<span style={{ color: 'var(--ember)' }}>Forge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navItems.map(({ path, label, icon: Icon, highlight }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={highlight ? 'ff-btn ff-btn-primary' : 'ff-btn ff-btn-ghost'}
                style={{
                  ...(active && !highlight ? {
                    color: 'var(--text-primary)',
                    background: 'var(--amethyst-glow)',
                  } : {}),
                  fontSize: '13px',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}

          <div style={{
            width: '1px',
            height: '28px',
            background: 'var(--border)',
            margin: '0 8px',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em',
            }}>
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="ff-btn ff-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
