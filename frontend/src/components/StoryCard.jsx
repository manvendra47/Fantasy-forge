import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Lock, Heart, Clock, AlignLeft, Feather } from 'lucide-react';
import api from '../utils/api';

const GENRE_COLORS = {
  epic: '#8a6eff',
  dark: '#cc4444',
  whimsical: '#4db86e',
  mythological: '#c9a227',
  steampunk: '#b87333',
  cosmic: '#4488cc',
  romance: '#cc6699',
  adventure: '#44aacc',
  necromance: '#5f3f53',
};

const GENRE_ICONS = {
  epic: '⚔️', dark: '🌑', whimsical: '✨', mythological: '🏛️',
  steampunk: '⚙️', cosmic: '🌌', romance: '🌹', adventure: '🗺️',
  necromance: '💀',
};

export default function StoryCard({ story, onVisibilityChange, showAuthor = false }) {
  const [visibility, setVisibility] = useState(story.visibility);
  const [likeCount, setLikeCount] = useState(story.likeCount || story.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(story.isLiked || false);
  const [toggling, setToggling] = useState(false);

  const genreColor = GENRE_COLORS[story.genre] || '#8a6eff';
  const genreIcon = GENRE_ICONS[story.genre] || '📖';

  const toggleVisibility = async (e) => {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    const next = visibility === 'public' ? 'private' : 'public';
    try {
      await api.patch(`/stories/${story._id}/visibility`, { visibility: next });
      setVisibility(next);
      onVisibilityChange?.(story._id, next);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/stories/${story._id}/like`);
      setLikeCount(res.data.likeCount);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const wordCount = story.wordCount || 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  const preview = story.content?.slice(0, 140).trim() + '…';
  const dateStr = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link to={`/story/${story._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className="ff-card"
        style={{
          padding: '20px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Genre stripe */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: genreColor,
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              letterSpacing: '0.02em',
              marginBottom: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {genreIcon} {story.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                color: genreColor,
                background: `${genreColor}18`,
                padding: '2px 8px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {story.genre}
              </span>
              {showAuthor && story.author && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Feather size={10} />
                  {story.author.username}
                </span>
              )}
            </div>
          </div>

          {/* Visibility toggle (only for owner) */}
          {!showAuthor && (
            <button
              onClick={toggleVisibility}
              disabled={toggling}
              title={visibility === 'public' ? 'Make private' : 'Make public'}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                color: visibility === 'public' ? 'var(--gold)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
              {visibility}
            </button>
          )}
        </div>

        {/* Preview */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '14px',
        }}>
          {preview}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlignLeft size={11} /> {wordCount} words
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {readTime} min read
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {story.visibility === 'public' && (
              <button
                onClick={handleLike}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isLiked ? '#e05b8a' : 'var(--text-muted)',
                  fontSize: '11px',
                  padding: '2px 4px',
                  transition: 'color 0.2s',
                }}
              >
                <Heart size={12} fill={isLiked ? '#e05b8a' : 'none'} />
                {likeCount}
              </button>
            )}
            <span>{dateStr}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
