import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StoryCard from '../components/StoryCard';
import api from '../utils/api';
import { BookOpen, Globe, Lock, PlusCircle, Feather, ChevronDown } from 'lucide-react';

const GENRES = ['all', 'epic', 'dark', 'whimsical', 'mythological', 'steampunk', 'cosmic', 'romance', 'adventure'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState({ total: 0, public: 0, private: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ genre: 'all', visibility: 'all' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filter.genre !== 'all') params.append('genre', filter.genre);
      if (filter.visibility !== 'all') params.append('visibility', filter.visibility);

      const res = await api.get(`/stories/my?${params}`);
      setStories(res.data.stories);
      setTotalPages(res.data.pages);

      // Compute stats from full count
      if (page === 1 && filter.genre === 'all' && filter.visibility === 'all') {
        const pub = res.data.stories.filter(s => s.visibility === 'public').length;
        setStats({ total: res.data.total, public: pub, private: res.data.total - pub });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleVisibilityChange = (id, newVis) => {
    setStories(prev => prev.map(s => s._id === id ? { ...s, visibility: newVis } : s));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story forever?')) return;
    try {
      await api.delete(`/stories/${id}`);
      setStories(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          Welcome back, Scribe
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          marginBottom: '24px',
        }}>
          {user?.username}'s Tome
        </h1>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '500px' }}>
          {[
            { label: 'Total Stories', value: stats.total, icon: BookOpen, color: 'var(--amethyst)' },
            { label: 'Public', value: stats.public, icon: Globe, color: 'var(--gold)' },
            { label: 'Private', value: stats.private, icon: Lock, color: 'var(--text-muted)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="ff-card" style={{ padding: '16px', textAlign: 'center' }}>
              <Icon size={18} color={color} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color, fontWeight: '700' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + New Story */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              className="ff-select"
              value={filter.genre}
              onChange={e => { setFilter(f => ({ ...f, genre: e.target.value })); setPage(1); }}
              style={{ paddingRight: '32px', width: 'auto', minWidth: '120px' }}
            >
              {GENRES.map(g => <option key={g} value={g}>{g === 'all' ? 'All Genres' : g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>
          </div>
          <select
            className="ff-select"
            value={filter.visibility}
            onChange={e => { setFilter(f => ({ ...f, visibility: e.target.value })); setPage(1); }}
            style={{ width: 'auto', minWidth: '110px' }}
          >
            <option value="all">All Stories</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <Link to="/generate" className="ff-btn ff-btn-primary">
          <PlusCircle size={16} />
          Forge New Story
        </Link>
      </div>

      {/* Story grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>📜</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            No stories yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontFamily: 'var(--font-body)' }}>
            Your legend awaits. Forge your first tale.
          </p>
          <Link to="/generate" className="ff-btn ff-btn-primary">
            <Feather size={16} /> Begin Writing
          </Link>
        </div>
      ) : (
        <>
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {stories.map(story => (
              <StoryCard
                key={story._id}
                story={story}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="ff-btn"
                  style={{
                    width: '36px', height: '36px',
                    justifyContent: 'center',
                    padding: '0',
                    background: p === page ? 'var(--amethyst)' : 'var(--bg-card)',
                    color: p === page ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
