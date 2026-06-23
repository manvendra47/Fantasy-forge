import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        avatar: form.avatar,
        bio: form.bio,
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px', display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-card)', display: 'grid', placeItems: 'center' }}>
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={38} color="var(--text-muted)" />
            )}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
              Your account
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Profile Settings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
              Update your username, email, avatar, and bio.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Username</label>
          <input
            className="ff-input"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Your username"
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Email</label>
          <input
            className="ff-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Avatar URL</label>
          <input
            className="ff-input"
            type="text"
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Bio</label>
          <textarea
            className="ff-textarea"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell readers a bit about yourself"
            rows={4}
            maxLength={200}
          />
        </div>

        {message && <div style={{ color: 'var(--success)', fontSize: '14px' }}>{message}</div>}
        {error && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>}

        <button type="submit" className="ff-btn ff-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
