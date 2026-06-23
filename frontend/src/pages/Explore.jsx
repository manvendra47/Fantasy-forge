import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import api from '../utils/api';
import { Search, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GENRES = ['all', 'epic', 'dark', 'whimsical', 'mythological', 'steampunk', 'cosmic', 'romance', 'adventure'];

export default function Explore() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ genre: 'all', sort: 'newest' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort: filter.sort });
      if (filter.genre !== 'all') params.append('genre', filter.genre);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/stories/public?${params}`);
      setStories(res.data.stories);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchStories, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStories]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          The Grand Library
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}>
          Explore Stories
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          {total > 0 ? `${total} tales forged by ${user ? 'fellow' : ''} adventurers` : 'Discover tales forged by adventurers'}
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="ff-input"
            placeholder="Search stories…"
            value={search}
            onChange={handleSearch}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <select
          className="ff-select"
          value={filter.genre}
          onChange={e => { setFilter(f => ({ ...f, genre: e.target.value })); setPage(1); }}
          style={{ width: 'auto', minWidth: '120px' }}
        >
          {GENRES.map(g => <option key={g} value={g}>{g === 'all' ? 'All Genres' : g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
        </select>

        <select
          className="ff-select"
          value={filter.sort}
          onChange={e => { setFilter(f => ({ ...f, sort: e.target.value })); setPage(1); }}
          style={{ width: 'auto', minWidth: '110px' }}
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Liked</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Genre pill filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => { setFilter(f => ({ ...f, genre: g })); setPage(1); }}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: `1px solid ${filter.genre === g ? 'var(--amethyst)' : 'var(--border)'}`,
              background: filter.genre === g ? 'var(--amethyst-glow)' : 'transparent',
              color: filter.genre === g ? 'var(--amethyst-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {g === 'all' ? 'All' : g}
          </button>
        ))}
      </div>

      {/* Stories grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.4 }}>🌍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            No tales found
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontFamily: 'var(--font-body)' }}>
            {search ? 'Try different search terms' : 'Be the first to share a story with the realm'}
          </p>
          {user && (
            <Link to="/generate" className="ff-btn ff-btn-primary">
              <Compass size={16} /> Forge the First Tale
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {stories.map(story => (
              <StoryCard key={story._id} story={story} showAuthor />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

      {/* CTA for guests */}
      {!user && (
        <div style={{
          marginTop: '48px',
          background: 'linear-gradient(135deg, var(--amethyst-glow) 0%, var(--ember-glow) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Ready to Forge Your Own Legend?
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontFamily: 'var(--font-body)' }}>
            Join FantasyForge and let AI craft your epic tales
          </p>
          <Link to="/auth" className="ff-btn ff-btn-primary" style={{ fontSize: '15px', padding: '12px 28px' }}>
            Begin Your Quest
          </Link>
        </div>
      )}
    </div>
  );
}
