# GenMedia: AI Generative Media Web App

A web application for generating, managing, and tweaking AI-generated imagery. Inspired by the workflows of platforms like Freepik, this project was developed as a Forward Deployed Engineer assignment. It prioritizes user experience, asynchronous state management, and clear architectural boundaries over feature bloat.

---

## Product Vision & Motivation

The goal of GenMedia is to bridge the gap between raw AI inference APIs and an intuitive creative tool. Direct interactions with external AI generation APIs often surface latency, cold starts, and rigid inputs directly to the user. This project addresses those constraints by treating **async states and slow-model UX as first-class product concerns**. 

By coupling an async-handling strategy on the backend with a responsive frontend, the application ensures a continuous user flow from text prompt to final edited asset, gracefully masking infrastructure delays.

---

## Key Features

- **Prompt-to-Image AI Generation:** Text-to-image synthesis via the Hugging Face Inference API.
- **Style Presets:** Parameter modifiers (e.g., Cinematic, Anime) mapped to specific prompting structures.
- **Tweak & Regenerate Flow:** Users can branch off past generations to iterate on prompts without losing context.
- **Gallery & History System:** Session-based persistent view to browse and manage previous generations.
- **Canvas Editing:** A lightweight editor allowing users to add, position, and export custom text overlays on generated images via `react-draggable` and `html2canvas`.
- **Graceful Async & Error Handling:** Comprehensive visual feedback for model cold starts, API rate limits, and network latency.

---

## Demo Workflow

1. **Ideate:** User inputs a base prompt and selects a visual style.
2. **Generate:** The backend handles the Hugging Face API request, returning structured loading states or cold-start estimates to the client.
3. **Iterate:** Output is reviewed in the gallery. The "Tweak" action loads the prompt and metadata back into the editor for refinement.
4. **Edit & Export:** Users can open a detailed view, apply custom text overlays, and export the composited image as a unified asset.

---

## Tech Stack

**Frontend:**
- **React (Vite):** Component-based UI and optimized build tooling.
- **Tailwind CSS:** Utility-first styling for maintainable design systems.
- **Framer Motion:** Component transitions and UI state animations.
- **react-draggable / html2canvas:** Client-side DOM manipulation and image compositing.
- **Axios:** HTTP client for robust API interactions.

**Backend:**
- **Node.js & Express:** Non-blocking API layer and request orchestration.
- **Hugging Face Inference API:** External service powering core AI image generation.

---

## Architecture Overview

The application utilizes a decoupled client-server architecture designed to insulate the frontend from the volatility of external AI APIs.

### Frontend Architecture
The frontend is built as a single-page application (SPA) focused on state predictability. Components are modularized, strictly separating visual presentation from business logic (custom hooks for API interactions). Global state is flat, mapping directly to backend data contracts.

### Backend Architecture
The Express backend acts as an orchestration and abstraction layer. It secures API keys, normalizes error payloads from Hugging Face, and manages the temporary persistence of generation metadata. Routes, controllers, and services are logically separated.

### Data Flow
1. **Client** dispatches a prompt and style configuration.
2. **Backend** validates the payload and forwards the request to the Hugging Face API.
3. **External API** processes the image. If the model is experiencing a cold start, the backend intercepts the `503 Service Unavailable` error, extracts the `estimated_time`, and returns a structured response to the client.
4. **Client** interprets the response to display appropriate loading UI or countdowns.
5. **Backend** stores successful generation metadata in the temporary data store.

---

## Engineering Tradeoffs & Decisions

### 1. Intentional MVP Scoping
This project was strictly scoped to demonstrate core competency in full-stack engineering and product UX. Development effort was intentionally allocated away from generic platform features (authentication, social feeds) and directed toward polishing the core interaction loop: Generate → Tweak → Edit → Export.

### 2. In-Memory Storage Abstraction
An in-memory store abstraction (implementing a generic repository pattern) was chosen over a dedicated persistent database (like PostgreSQL).
* **Reasoning:** It allows for zero-dependency local setup during the assignment review process.
* **Flexibility:** The storage layer is abstracted behind a Service/Repository interface, making future migration to a relational database a drop-in replacement that requires no changes to routing or controller logic.

### 3. Async UX Handling Strategy
External AI APIs are inherently unpredictable. To mitigate user friction, "Model Loading" states (frequent on Hugging Face free tiers) are intercepted and translated into UI countdowns or estimated wait times, keeping the user informed rather than abandoning the request due to perceived timeouts.

### 4. Error Handling Strategy
Errors are handled at system boundaries. The backend normalizes external exceptions (rate limits, bad inputs, network timeouts) into a standardized `{ error: string, code: string }` JSON format. Frontend Axios interceptors catch these and display non-intrusive notifications, preventing application crashes.

---

## Scalability Considerations & Future Improvements

To scale this application to production, the following architectural upgrades would be prioritized:
1. **Persistent Storage:** Replacing the in-memory store with PostgreSQL (via Prisma or Drizzle) for structured, relational user data.
2. **Cloud Object Storage:** Pushing generated image buffers directly to AWS S3 or Cloudflare R2, passing CDN URLs to the client rather than relying on Base64 strings or local server memory.
3. **Message Queues:** Implementing Redis and BullMQ for asynchronous job processing, allowing the API to immediately return a job ID rather than holding HTTP connections open during long generation cycles.
4. **LoRA Support:** Extending the backend to route inference requests dynamically based on a `model_id` parameter, enabling support for custom fine-tuned models.

---

## Known Limitations

- **Volatile Storage:** Due to the use of an in-memory database, all generated images and history are lost when the backend server restarts.
- **Synchronous Generation:** The current implementation holds the HTTP connection open while waiting for the Hugging Face API. While mitigated by frontend UX, a production deployment would require a webhook or polling-based queuing system.
- **Hugging Face Free Tier Limits:** The application relies on external rate limits. Extended usage may result in temporary IP bans or heavy throttling by the Hugging Face API.

---

## Folder Structure

```text
Generative-media-webapp/
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instances and API wrappers
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main route components
│   │   ├── utils/          # Helper functions (e.g., export logic)
│   │   ├── App.jsx         # Root component & routing
│   │   └── index.css       # Tailwind entry and custom global styles
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/    # Route handlers
    │   ├── routes/         # Express router definitions
    │   ├── services/       # Business logic & external API integration
    │   ├── store/          # Database abstractions
    │   └── index.js        # Server entry point
    ├── .env.example
    └── package.json
```

---

## API Endpoints

| Method   | Endpoint                          | Description                  |
| :------- | :-------------------------------- | :--------------------------- |
| `POST`   | `/api/generate`                   | Generate a new AI image      |
| `GET`    | `/api/generations`                | Retrieve generation history  |
| `GET`    | `/api/generations/:id`            | Retrieve a single generation |
| `POST`   | `/api/generations/:id/regenerate` | Tweak & regenerate an image  |
| `DELETE` | `/api/generations/:id`            | Delete a generation          |
| `GET`    | `/health`                         | Health check endpoint        |

*(Note: In a production environment, these would be secured via an `Authorization` header tied to a user session.)*

---

## Local Development Setup

### 1. Environment Variables
Create a `.env` file in the `backend` directory using `.env.example` as a template:
```env
PORT=5000
HF_API_KEY=your_huggingface_token_here
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*(Server runs on http://localhost:5000)*

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*(Client runs on http://localhost:5173)*

---

## Deployment Instructions

**Backend (Render):**
1. Connect the GitHub repository to Render as a new "Web Service".
2. Set the Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add `HF_API_KEY` to Environment Variables.

**Frontend (Vercel):**
1. Import the repository into Vercel.
2. Set the Framework Preset to Vite.
3. Set the Root Directory to `frontend`.
4. Add `VITE_API_URL` to Environment Variables, pointing to the deployed Render backend URL.
5. Deploy.

---

## Time Spent

- **Architecture & Scaffolding:** ~1.5 hrs
- **Backend & External API Integration:** ~2 hrs
- **Frontend Core & State Management:** ~2.5 hrs
- **UI/UX Polish & Canvas Editing:** ~2.5 hrs
- **Documentation & Deployment Prep:** ~1.5 hrs
- **Total:** ~10 hours

---

## Conclusion

This project demonstrates a pragmatic approach to building modern AI applications. By focusing on the primary friction points of AI integration—latency, unreliability, and rigid interactions—this application delivers a responsive user experience while maintaining a codebase that is clean, maintainable, and structured for future scalability.
