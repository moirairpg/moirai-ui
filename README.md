<div align="center">
  <img src="public/logo.svg" alt="MoirAI" width="64" height="64">
  <h1>MoirAI Web UI</h1>
  <p>A web frontend for <a href="https://github.com/moirairpg/moirai">MoirAI</a> — an AI-powered text adventure platform.<br>Play and manage your adventures, worlds, and personas from any browser.</p>
</div>

<p align="center">
  <a href="https://github.com/moirairpg/moirai/issues">Bug Reports</a> · <a href="https://github.com/moirairpg/moirai">Backend (Story Engine)</a>
</p>

<p align="center">
  <a href="https://github.com/moirairpg/moirai-fe"><img src="https://img.shields.io/badge/Discord-Login-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Login"></a>
</p>

---

## Overview\w

MoirAI Web UI is the browser-based frontend for the MoirAI platform. It connects to the [Story Engine](https://github.com/moirairpg/moirai) backend and provides a full adventure gameplay experience, including real-time AI responses over WebSocket.

Authentication is handled entirely through Discord OAuth2 — no username or password required.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool and development server
- **Tailwind CSS** — styling
- **React Router** — client-side routing
- **i18next** — internationalisation

---

## Requirements

- Node.js v18 or higher
- The [MoirAI Story Engine](https://github.com/moirairpg/moirai) running locally or remotely
- A Discord application configured with OAuth2

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/moirairpg/moirai-ui.git
cd moirai-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.development` file for local development:

```env
BACKEND_HOST=localhost
BACKEND_PORT=8080
VITE_PORT=5173
```

For production, set these as environment variables in your CI/CD pipeline.

### 4. Run in development mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. All API and WebSocket requests are proxied to the backend at `http://localhost:8080`.

### 5. Build for production

```bash
npm run build
```

The output in `dist/` can be served as a static site by the Story Engine or any static file server (e.g. nginx).

---

## Discord OAuth2 Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create an application
2. Under **OAuth2**, add a redirect URL pointing to your backend's auth callback
3. Configure the backend with your Discord client ID and secret

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
