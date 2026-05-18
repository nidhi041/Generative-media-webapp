# GenMedia — AI Generative Media Web App

> Minimal, polished AI image generation MVP — Prompt → Image via Hugging Face

---

## Quick Start

### 1. Get a Hugging Face API key
Sign up at https://huggingface.co → Settings → Access Tokens → Create token (read).

### 2. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env → paste your HF_API_KEY
```

### 3. Run backend
```bash
cd backend
npm run dev       # nodemon watches for changes
```
Server starts at **http://localhost:5000**

### 4. Run frontend
```bash
cd frontend
npm run dev       # Vite dev server
```
App available at **http://localhost:5173**

---

## Project Structure

```
Generative-media-webapp/
├── backend/
│   ├── server.js                   # Express entry point
│   └── src/
│       ├── routes/
│       │   └── generation.routes.js  # All /api endpoints
│       ├── services/
│       │   └── huggingface.service.js # HF Inference API wrapper
│       ├── middleware/
│       │   └── errorHandler.js        # Global error + 404
│       └── data/
│           └── store.js               # In-memory store (swap for DB later)
└── frontend/
    ├── index.html
    └── src/
        ├── api/
        │   ├── client.js              # Axios instance
        │   └── generations.js         # API helpers
        ├── hooks/
        │   └── useGenerations.js      # All async/state logic
        ├── features/
        │   ├── generator/
        │   │   └── GeneratorForm.jsx
        │   └── gallery/
        │       ├── Gallery.jsx
        │       └── GalleryCard.jsx
        ├── components/ui/
        │   ├── Navbar.jsx
        │   └── Skeleton.jsx
        ├── App.jsx
        └── main.jsx
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/generate` | Generate new image |
| GET | `/api/generations` | List all generations |
| GET | `/api/generations/:id` | Single generation |
| POST | `/api/generations/:id/regenerate` | Tweak & regenerate |
| DELETE | `/api/generations/:id` | Delete generation |
| GET | `/health` | Health check |
