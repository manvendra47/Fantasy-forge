import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Globe, Lock, Heart, ArrowLeft, Feather, Clock, AlignLeft,
  Trash2, Edit3, Check, X
} from 'lucide-react';

const GENRE_COLORS = {
  epic: '#8a6eff', dark: '#cc4444', whimsical: '#4db86e',
  mythological: '#c9a227', steampunk: '#b87333', cosmic: '#4488cc',
  romance: '#cc6699', adventure: '#44aacc',
};

export default function StoryView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stories/${id}`);
        const s = res.data.story;
        setStory(s);
        setLikeCount(s.likeCount || 0);
        setIsLiked(s.isLiked || false);
        setTitleDraft(s.title);
      } catch (err) {
        setError(err.response?.data?.message || 'Story not found');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  const toggleVisibility = async () => {
    if (toggling) return;
    setToggling(true);
    const next = story.visibility === 'public' ? 'private' : 'public';
    try {
      await api.patch(`/stories/${id}/visibility`, { visibility: next });
      setStory(s => ({ ...s, visibility: next }));
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/stories/${id}/like`);
      setLikeCount(res.data.likeCount);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const saveTitle = async () => {
    if (!titleDraft.trim()) return;
    try {
      await api.patch(`/stories/${id}`, { title: titleDraft.trim() });
      setStory(s => ({ ...s, title: titleDraft.trim() }));
      setEditingTitle(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/stories/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ height: '28px', width: '160px', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '48px', width: '80%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: '12px' }}>{error}</h2>
      <Link to="/explore" className="ff-btn ff-btn-secondary">Back to Explore</Link>
    </div>
  );

  if (!story) return null;

  const genreColor = GENRE_COLORS[story.genre] || '#8a6eff';
  const readTime = Math.max(1, Math.round((story.wordCount || 0) / 200));
  const isOwner = story.isOwner;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px 80px' }} className="fade-in">
      {/* Back */}
      <Link
        to={isOwner ? '/dashboard' : '/explore'}
        className="ff-btn ff-btn-ghost"
        style={{ marginBottom: '24px', padding: '6px 0', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} />
        {isOwner ? 'Back to My Stories' : 'Back to Explore'}
      </Link>

      {/* Genre badge */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          fontSize: '11px', fontWeight: '700',
          color: genreColor,
          background: `${genreColor}18`,
          padding: '3px 10px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {story.genre}
        </span>
        {story.tone && (
          <span style={{
            fontSize: '11px', color: 'var(--text-muted)',
            marginLeft: '10px',
          }}>
            {story.tone} tone
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        {editingTitle ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              className="ff-input"
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              style={{ fontFamily: 'var(--font-display)', fontSize: '22px', flex: 1 }}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              autoFocus
            />
            <button onClick={saveTitle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amethyst-light)' }}><Check size={18} /></button>
            <button onClick={() => setEditingTitle(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
        ) : (
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 4vw, 36px)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            letterSpacing: '0.03em',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}>
            {story.title}
            {isOwner && (
              <button onClick={() => setEditingTitle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginTop: '4px', flexShrink: 0 }}>
                <Edit3 size={16} />
              </button>
            )}
          </h1>
        )}
      </div>

      {/* Meta bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        padding: '14px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Feather size={13} />
            {story.author?.username}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlignLeft size={13} /> {story.wordCount} words
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} /> {readTime} min read
          </span>
          {story.aiModel && (
            <span style={{ fontSize: '11px', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
              {story.aiModel}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Like button */}
          {story.visibility === 'public' && user && (
            <button
              onClick={handleLike}
              className="ff-btn ff-btn-secondary"
              style={{ padding: '6px 14px', gap: '6px', fontSize: '13px', color: isLiked ? '#e05b8a' : 'var(--text-secondary)', borderColor: isLiked ? 'rgba(224,91,138,0.4)' : 'var(--border)' }}
            >
              <Heart size={14} fill={isLiked ? '#e05b8a' : 'none'} />
              {likeCount}
            </button>
          )}
          {!user && story.visibility === 'public' && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={14} /> {likeCount}
            </span>
          )}

          {/* Visibility toggle */}
          {isOwner && (
            <>
              <button
                onClick={toggleVisibility}
                disabled={toggling}
                className="ff-btn ff-btn-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  color: story.visibility === 'public' ? 'var(--gold)' : 'var(--text-secondary)',
                  borderColor: story.visibility === 'public' ? 'rgba(201,162,39,0.4)' : 'var(--border)',
                }}
              >
                {story.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                {story.visibility === 'public' ? 'Public' : 'Private'}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ff-btn"
                style={{
                  background: 'rgba(204,68,68,0.08)',
                  border: '1px solid rgba(204,68,68,0.25)',
                  color: '#ff8888',
                  padding: '6px 12px',
                  fontSize: '13px',
                }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Story content */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '18px',
        lineHeight: '1.85',
        color: '#ddd8f5',
        letterSpacing: '0.01em',
      }}>
        {story.content.split('\n').map((para, i) => (
          para.trim() ? (
            <p key={i} style={{ marginBottom: '1.4em' }}>{para}</p>
          ) : (
            <div key={i} style={{ height: '0.6em' }} />
          )
        ))}
      </div>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div style={{ marginTop: '40px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {story.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '12px',
              color: 'var(--amethyst)',
              background: 'rgba(138,110,255,0.08)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(138,110,255,0.2)',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Prompt */}
      <div style={{
        marginTop: '48px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${genreColor}`,
        borderRadius: '0 8px 8px 0',
        padding: '16px 20px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Original Premise
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '14px' }}>
          "{story.prompt}"
        </p>
      </div>
    </div>
  );
}
