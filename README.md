# ⚔️ FantasyForge

**AI-powered fantasy story generator** — a full-stack MERN web app where users craft and share epic tales using free open-source language models.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6 |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| AI Providers | HuggingFace / Groq |
| Styling | Custom CSS with CSS variables |

---

## Features

- 🔐 **Auth** — Register, login, JWT sessions
- 🖊️ **Story Generator** — Choose genre, tone, length, characters, setting
- 📚 **My Dashboard** — View, manage, and filter your stories
- 🌍 **Explore** — Browse public stories with search + genre filters
- 🌗  **Theme Switch** — Light/Dark mode toggle
- 🔒 **Visibility Control** — Toggle any story between public/private instantly
- ❤️ **Likes** — Like public stories from other authors
- ✏️ **Edit** — Rename story titles inline
- 🗑️ **Delete** — Remove stories you no longer want
- ⏳ **Ratelimiter** — Prevents abuse of the AI generation endpoint
- 🤖 **3 AI Backends** — Ollama (local, 100% free), HuggingFace (free tier), Groq (free tier, fastest)

---

## Quick Start

### 1. Clone the repo

```bash
git clone <repo-url>
cd fantasy-forge
```

### 2. Install dependencies

```bash
# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fantasyforge
JWT_SECRET=change_this_to_a_long_random_string

# Choose your AI provider (see AI Setup section below)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongo mongo:latest
```

### 5. Start the app

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## AI Provider Setup

FantasyForge supports three free AI providers. Pick one and set `AI_PROVIDER` in `.env`.

### Option A: HuggingFace Inference API (free tier, no GPU needed)

1. Sign up at https://huggingface.co
2. Go to Settings → Access Tokens → New token (read permission)
3. Set in `.env`:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_your_token_here
   HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   ```

### Option B: Groq (free tier, extremely fast inference)

1. Sign up at https://console.groq.com
2. Create an API key
3. Set in `.env`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_your_key_here
   GROQ_MODEL=llama3-8b-8192   # or llama3-70b-8192 for better quality
   ```

---

## Project Structure

```
fantasy-forge/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── aiService.js       # AI provider abstraction (Ollama/HF/Groq)
│   ├── middleware/
│   │   └── auth.js            # JWT protect + optionalAuth middleware
│   ├── models/
│   │   ├── User.js            # User schema + bcrypt
│   │   └── Story.js           # Story schema with indexes
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   └── stories.js         # /api/stories/*
│   ├── server.js              # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── StoryCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx      # Login / Register
    │   │   ├── Dashboard.jsx     # User's story library
    │   │   ├── GenerateStory.jsx # Story generation form
    |   |   ├── ProfilePage.jsx   # users detail + update option 
    │   │   ├── StoryView.jsx     # Read + manage story
    │   │   └── Explore.jsx       # Public story browser
    │   ├── utils/
    │   │   └── api.js            # Axios instance
    │   ├── App.jsx               # Routes
    │   ├── main.jsx
    │   └── index.css             # Global design tokens
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (auth required) |
| PUT | `/api/auth/profile` | Update bio/avatar (auth required) |

### Stories
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/stories/generate` | Generate new AI story (auth required) |
| GET | `/api/stories/my` | Get user's stories (auth required) |
| GET | `/api/stories/public` | Get public stories (optional auth) |
| GET | `/api/stories/:id` | Get single story |
| PATCH | `/api/stories/:id` | Update title/tags/visibility (owner only) |
| PATCH | `/api/stories/:id/visibility` | Toggle public/private (owner only) |
| DELETE | `/api/stories/:id` | Delete story (owner only) |
| POST | `/api/stories/:id/like` | Toggle like on public story (auth required) |

---

## Customization

### Add a new genre
In `backend/config/aiService.js`, add to `GENRE_PROMPTS`:
```js
necromancy: 'a dark necromantic tale of undead armies and the secrets of life after death',
```

Then add it to both `GENRES` arrays in:
- `frontend/src/pages/GenerateStory.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Explore.jsx`

### Change story length limits
Edit `LENGTH_TOKENS` in `aiService.js`:
```js
long: { max: 2000, words: '1400–1800 words' },
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (use a long random string) |
| `AI_PROVIDER` | Yes |  | `huggingface`, or `groq` |
| `HUGGINGFACE_API_KEY` | If HF | — | HuggingFace access token |
| `HUGGINGFACE_MODEL` | If HF | Mistral-7B-Instruct-v0.2 | HF model ID |
| `GROQ_API_KEY` | If Groq | — | Groq API key |
| `GROQ_MODEL` | If Groq | llama-3.3-70b-versatile | Groq model ID |
| `CLIENT_URL` | No | http://localhost:5173 | CORS allowed origin |

---

## License

Apache License 2.0 — build something legendary.
