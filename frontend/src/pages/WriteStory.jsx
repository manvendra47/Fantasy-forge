import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { BookOpen, Save, Sparkles, ArrowLeft } from 'lucide-react';

const GENRES = [
  { id: 'epic', label: 'Epic', desc: 'Grand battles & legendary heroes' },
  { id: 'dark', label: 'Dark', desc: 'Gloom, dread & moral shadows' },
  { id: 'whimsical', label: 'Whimsical', desc: 'Magic, wonder & playful charm' },
  { id: 'mythological', label: 'Mythological', desc: 'Gods, prophecies & ancient legends' },
  { id: 'steampunk', label: 'Steampunk', desc: 'Clockwork and arcane invention' },
  { id: 'cosmic', label: 'Cosmic', desc: 'Eldritch mysteries & vast unknowns' },
  { id: 'romance', label: 'Romance', desc: 'Fated love & enchanted longing' },
  { id: 'adventure', label: 'Adventure', desc: 'Quests, ruins & dangerous journeys' },
  { id: 'necromance', label: 'Necromance', desc: 'Forbidden magic & the dead' },
];

export default function WriteStory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    prompt: '',
    content: '',
    genre: 'epic',
    visibility: 'private',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please give your story a title.');
      return;
    }
    if (!form.content.trim() || form.content.trim().length < 20) {
      setError('Please write at least 20 characters of story content.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const res = await api.post('/stories/manual', {
        title: form.title.trim(),
        prompt: form.prompt.trim() || form.title.trim(),
        content: form.content.trim(),
        genre: form.genre,
        visibility: form.visibility,
      });
      navigate(`/story/${res.data.story._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your story.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" className="ff-btn ff-btn-ghost" style={{ marginBottom: '12px', padding: '6px 0' }}>
          <ArrowLeft size={16} /> Back to My Stories
        </Link>
        <p style={{ fontSize: '12px', color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          Manual Writing
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Write Your Own Tale
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: '15px' }}>
          Save your draft now, then come back later to continue it or expand the story.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '22px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Story Title</label>
          <input
            className="ff-input"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="The name of your story"
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Opening Premise</label>
          <textarea
            className="ff-input"
            value={form.prompt}
            onChange={(e) => setField('prompt', e.target.value)}
            placeholder="What idea, scene, or character do you want to begin with?"
            rows={3}
            style={{ resize: 'vertical', minHeight: '84px' }}
          />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="ff-label">Story Content</label>
          <textarea
            className="ff-input"
            value={form.content}
            onChange={(e) => setField('content', e.target.value)}
            placeholder="Start writing your story here..."
            rows={12}
            style={{ resize: 'vertical', minHeight: '260px', lineHeight: '1.7', fontFamily: 'var(--font-body)', fontSize: '16px' }}
            required
          />
        </div>

        <div>
          <label className="ff-label">Genre</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {GENRES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setField('genre', g.id)}
                style={{
                  background: form.genre === g.id ? 'var(--amethyst-glow)' : 'var(--bg-card)',
                  border: `1px solid ${form.genre === g.id ? 'var(--amethyst)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', color: form.genre === g.id ? 'var(--amethyst-light)' : 'var(--text-primary)', fontSize: '13px' }}>{g.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={form.visibility === 'private'}
              onChange={() => setField('visibility', 'private')}
            />
            Private draft
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={form.visibility === 'public'}
              onChange={() => setField('visibility', 'public')}
            />
            Public story
          </label>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>}

        <button type="submit" className="ff-btn ff-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : <><Save size={16} /> Save Manual Story</>}
        </button>
      </form>
    </div>
  );
}
