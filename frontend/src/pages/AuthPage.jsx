import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background runes decoration */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: 0.03,
        fontSize: '320px',
        userSelect: 'none',
      }}>
        ᚱ
      </div>

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--ember) 0%, #b05010 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px var(--ember-glow)',
            }}>
              <Feather size={24} color="#fff" />
            </div>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
          }}>
            Fantasy<span style={{ color: 'var(--ember)' }}>Forge</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
            Where legends are written
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '36px',
        }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-void)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'register' && (
              <div>
                <label className="ff-label">Username</label>
                <input
                  className="ff-input"
                  type="text"
                  name="username"
                  placeholder="Your adventurer's name"
                  value={form.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
              </div>
            )}

            <div>
              <label className="ff-label">Email</label>
              <input
                className="ff-input"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="ff-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="ff-input"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(204, 68, 68, 0.12)',
                border: '1px solid rgba(204, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#ff8888',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="ff-btn ff-btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px', marginTop: '4px' }}
            >
              {loading ? <div className="spinner" /> : null}
              {loading ? 'Loading…' : mode === 'login' ? 'Enter the Realm' : 'Begin Your Quest'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Stories are generated by open-source AI models
        </p>
      </div>
    </div>
  );
}
