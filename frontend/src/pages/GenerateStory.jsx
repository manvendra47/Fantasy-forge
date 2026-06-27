import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Wand2, Plus, X, Globe, Lock, Feather, ChevronRight } from 'lucide-react';

const GENRES = [
  { id: 'epic', label: 'Epic', icon: '⚔️', desc: 'Grand battles & legendary heroes' },
  { id: 'dark', label: 'Dark', icon: '🌑', desc: 'Grim atmosphere & moral complexity' },
  { id: 'whimsical', label: 'Whimsical', icon: '✨', desc: 'Fairy-tale wonder & magic' },
  { id: 'mythological', label: 'Mythological', icon: '🏛️', desc: 'Gods, prophecies & ancient powers' },
  { id: 'steampunk', label: 'Steampunk', icon: '⚙️', desc: 'Clockwork dragons & airships' },
  { id: 'cosmic', label: 'Cosmic', icon: '🌌', desc: 'Eldritch truths & vast unknowns' },
  { id: 'romance', label: 'Romance', icon: '🌹', desc: 'Fated love & enchanted realms' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️', desc: 'Quests, dungeons & lost treasures' },
  { id: 'necromance', label: 'Necromance', icon: '💀', desc: 'Necromancy & forbidden magic' },
];

const TONES = [
  { id: 'heroic', label: 'Heroic' }, { id: 'mysterious', label: 'Mysterious' },
  { id: 'lighthearted', label: 'Lighthearted' }, { id: 'dark', label: 'Dark' },
  { id: 'romantic', label: 'Romantic' }, { id: 'philosophical', label: 'Philosophical' },
];

const LENGTHS = [
  { id: 'short', label: 'Short', desc: '~500 words', time: '2 min' },
  { id: 'medium', label: 'Medium', desc: '~700 words', time: '4 min' },
  { id: 'long', label: 'Long', desc: '~1300 words', time: '7 min' },
];

const PROMPTS = [
  "A disgraced knight discovers an ancient dragon bound by forgotten runes in the ruins of a cursed city.",
  "A young witch's spell goes wrong, accidentally awakening a trickster god who was never meant to be freed.",
  "Two rival assassins from different kingdoms must cooperate to retrieve a stolen enchanted artifact.",
  "An immortal bard has sung the same song for a thousand years — until tonight, when the words change.",
  "A mapmaker discovers that every map she draws becomes real, with consequences she cannot undo.",
  "A cursed forest appears overnight, and the villagers must venture inside to find out why.",
  "A prince must choose between his kingdom and the love of a mysterious being from another realm.",
  "A shipwrecked crew finds themselves on an island where time flows backward, and they must escape before they un-age into nothingness.",
  "A scholar deciphers a prophecy that predicts the end of magic, but the prophecy itself is alive and changing.",
  "A city built on clouds is threatened by a storm that seems to have a mind of its own, and only a child can calm it.",
];

export default function GenerateStory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prompt: '',
    genre: 'epic',
    tone: 'heroic',
    length: 'medium',
    characters: [],
    setting: '',
    tags: [],
    visibility: 'private',
  });
  const [charInput, setCharInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('');
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addCharacter = () => {
    const name = charInput.trim();
    if (name && form.characters.length < 5 && !form.characters.includes(name)) {
      set('characters', [...form.characters, name]);
      setCharInput('');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && form.tags.length < 8 && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.prompt.trim()) { setError('Please enter a story premise'); return; }
    if (form.prompt.trim().length < 10) { setError('Premise must be at least 10 characters'); return; }

    setError('');
    setGenerating(true);

    const phases = [
      'Consulting the ancient tomes…',
      'Weaving the narrative threads…',
      'Breathing life into characters…',
      'Polishing the final scroll…',
    ];
    let phaseIdx = 0;
    setPhase(phases[0]);
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setPhase(phases[phaseIdx]);
    }, 3500);

    try {
      const res = await api.post('/stories/generate', form);
      clearInterval(interval);
      navigate(`/story/${res.data.story._id}`);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.message || 'Generation failed. Check your AI provider is running.');
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          The Forge
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
          Forge a New Story
        </h1>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Premise */}
        <div>
          <label className="ff-label">Story Premise *</label>
          <textarea
            className="ff-input"
            placeholder="Describe the heart of your story — a character, a conflict, a world, or a moment…"
            value={form.prompt}
            onChange={e => set('prompt', e.target.value)}
            rows={4}
            style={{ resize: 'vertical', minHeight: '96px', lineHeight: '1.6', fontFamily: 'var(--font-body)', fontSize: '15px' }}
            required
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px', alignSelf: 'center' }}>Try:</span>
            {(showAllPrompts ? PROMPTS : PROMPTS.slice(0, 3)).map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => set('prompt', p)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.target.style.borderColor = 'var(--border-bright)'}
                onMouseOut={e => e.target.style.borderColor = 'var(--border)'}
              >
                {p.slice(0, 48)}…
              </button>
            ))}
            {PROMPTS.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllPrompts((prev) => !prev)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--amethyst-light)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {showAllPrompts ? 'Show less' : '⋯ More'}
              </button>
            )}
          </div>
        </div>

        {/* Genre */}
        <div>
          <label className="ff-label">Genre</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            {GENRES.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => set('genre', g.id)}
                style={{
                  background: form.genre === g.id ? 'var(--amethyst-glow)' : 'var(--bg-card)',
                  border: `1px solid ${form.genre === g.id ? 'var(--amethyst)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{g.icon}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: '600', fontSize: '13px', color: form.genre === g.id ? 'var(--amethyst-light)' : 'var(--text-primary)', marginBottom: '2px' }}>{g.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone + Length */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="ff-label">Tone</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TONES.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tone"
                    value={t.id}
                    checked={form.tone === t.id}
                    onChange={() => set('tone', t.id)}
                    style={{ accentColor: 'var(--amethyst)', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: form.tone === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="ff-label">Length</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LENGTHS.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => set('length', l.id)}
                  style={{
                    background: form.length === l.id ? 'var(--amethyst-glow)' : 'var(--bg-card)',
                    border: `1px solid ${form.length === l.id ? 'var(--amethyst)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '13px', color: form.length === l.id ? 'var(--amethyst-light)' : 'var(--text-primary)' }}>{l.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{l.desc} · {l.time} read</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Characters */}
        <div>
          <label className="ff-label">Characters (optional, max 5)</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              className="ff-input"
              placeholder="Character name or description"
              value={charInput}
              onChange={e => setCharInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCharacter(); }}}
            />
            <button type="button" onClick={addCharacter} className="ff-btn ff-btn-secondary" style={{ flexShrink: 0 }}>
              <Plus size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {form.characters.map(c => (
              <span key={c} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {c}
                <button type="button" onClick={() => set('characters', form.characters.filter(x => x !== c))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0', lineHeight: 1 }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Setting */}
        <div>
          <label className="ff-label">Setting (optional)</label>
          <input
            className="ff-input"
            placeholder="e.g. The Ashen Wastes beyond the Dawnwall, where no sun has risen in a century"
            value={form.setting}
            onChange={e => set('setting', e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="ff-label">Tags (optional)</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              className="ff-input"
              placeholder="dragons, betrayal, redemption…"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
            />
            <button type="button" onClick={addTag} className="ff-btn ff-btn-secondary" style={{ flexShrink: 0 }}>
              <Plus size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {form.tags.map(t => (
              <span key={t} style={{
                background: 'rgba(138,110,255,0.1)',
                border: '1px solid rgba(138,110,255,0.25)',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '11px',
                color: 'var(--amethyst-light)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                #{t}
                <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amethyst)', padding: '0', lineHeight: 1 }}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="ff-label">Visibility</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { id: 'private', label: 'Private', icon: Lock, desc: 'Only you can read it' },
              { id: 'public', label: 'Public', icon: Globe, desc: 'Share with the realm' },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => set('visibility', id)}
                style={{
                  flex: 1,
                  background: form.visibility === id ? (id === 'public' ? 'rgba(201,162,39,0.1)' : 'var(--amethyst-glow)') : 'var(--bg-card)',
                  border: `1px solid ${form.visibility === id ? (id === 'public' ? 'var(--gold)' : 'var(--amethyst)') : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} color={form.visibility === id ? (id === 'public' ? 'var(--gold)' : 'var(--amethyst-light)') : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(204, 68, 68, 0.1)',
            border: '1px solid rgba(204, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#ff8888',
          }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <div style={{ paddingBottom: '24px' }}>
          {generating ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '28px',
              textAlign: 'center',
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '56px', height: '56px',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--ember)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Feather size={20} color="var(--ember)" />
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
              }}>
                {phase}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                This may take 15–60 seconds depending on your AI provider
              </div>
            </div>
          ) : (
            <button type="submit" className="ff-btn ff-btn-primary" style={{
              width: '100%', justifyContent: 'center',
              padding: '16px', fontSize: '15px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em',
            }}>
              <Wand2 size={18} />
              Forge This Story
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
