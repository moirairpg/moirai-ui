# MoirAI Web UI
[![Run build](https://github.com/moirairpg/moirai-ui/actions/workflows/automated-build.yaml/badge.svg)](https://github.com/moirairpg/moirai-ui/actions/workflows/automated-build.yaml)

MoirAI Web UI is the web frontend for MoirAI, an AI-powered text adventure platform. It talks to the [MoirAI Story Engine](https://github.com/moirairpg/story-engine) through its REST API and WebSocket interface, and lets players create worlds, adventures and characters, play adventures in real time, and manage their account from any browser.

## Technologies used
* TypeScript
* React 18
* Vite
* Tailwind CSS
* React Router
* i18next
* STOMP over WebSocket (`@stomp/stompjs`)

## What does it do?
MoirAI Web UI is where players use MoirAI. They create worlds, adventures and player characters, invite other players, and play adventures with the AI narrator, seeing every message, dice roll and narration as it happens. All game logic, AI generation and authentication live in the Story Engine; the UI only calls it.

## Is it free?
Yes and no. The code is free to use. However, the Story Engine it depends on relies on OpenAI's API for text generation and moderation, so you will need an OpenAI account and will be billed according to your usage and chosen model.

## Which AI models are supported?
The UI does not call any AI model itself. Models are chosen and called by the Story Engine, which currently supports OpenAI's GPT-5 model family.

## Building from source
To run MoirAI Web UI locally, you will need Node.js 22 (see `.nvmrc`), Yarn, and a running MoirAI Story Engine. Sign-in and sign-up go through the Story Engine, so the UI needs no Discord or OpenAI keys of its own.

### Configuration
The development server reads these variables from a `.env` file in the project root. Copy `.env.example` to `.env` and adjust it:
- `BACKEND_HOST` — host of the Story Engine (default `localhost`)
- `BACKEND_PORT` — port of the Story Engine (default `8080`)
- `VITE_PORT` — port of the development server (default `5173`)
- `HOST` — address the development server listens on (default `0.0.0.0`)

All requests to `/api` and `/ws` are proxied to the Story Engine, so the browser only ever talks to the UI's own address.

### Building
1. Clone the repo
2. Install dependencies with `yarn install`
3. Copy `.env.example` to `.env` and adjust it if your Story Engine is not on `localhost:8080`
4. Run the application:
    - In development, with hot reload: `yarn dev`, then open `http://localhost:5173`
    - As a production build: `yarn build`, which writes a static site to `dist/`, and `yarn preview` to try it locally

Other scripts: `yarn typecheck` (TypeScript), `yarn lint` and `yarn lint:fix` (ESLint).

### With Docker
1. Clone the repo
2. Build the image with `docker build -t moirai-ui .`
3. Run it with `docker run -p 80:80 moirai-ui`

The image serves the static build with nginx on port 80. It does not route `/api` and `/ws` itself: whatever sits in front of it must send those paths to the Story Engine on the same host.

## Features
* Explore, My stuff and Shared with me pages for worlds, adventures and characters
* World and adventure editors, with lorebooks, narrator settings, images and sharing
* Player characters with a character sheet, level-ups and respec
* Real-time adventure play over WebSockets, with dice rolls and narration as they happen
* Invitations, notifications and broadcasts
* Account settings, and user and notification management for admins
* Sign-in and sign-up with Discord, handled by the Story Engine
* English and Portuguese
