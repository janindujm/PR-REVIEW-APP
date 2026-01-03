# PR Review App

A full-stack app to automate and manage pull request reviews. The backend listens for GitHub webhook events, fetches PR diffs, generates AI-based review feedback, and stores PR status in MongoDB. The frontend provides a dashboard to search, filter, and act on PRs.

## Overview

- Backend: Node.js + Express API, GitHub integration, AI review via GitHub Models API.
- Frontend: React + Vite single-page app, built to static assets.
- Database: MongoDB for PR storage.
- Containers: Docker images for backend, frontend, and MongoDB; `docker-compose` orchestrates them.
- IaC: Terraform in `iaac/` for cloud provisioning (e.g., EC2, security groups, etc.).

## Project Structure

- [backend/](backend/) — Express server, routes, controllers, GitHub + AI services, compose file
- [frontend/](frontend/) — React app (Vite), TS configs, build scripts
- [iaac/](iaac/) — Terraform configuration for cloud infra

Key files:

- [backend/app.js](backend/app.js)
- [backend/routes.js](backend/routes.js)
- [backend/controller.js](backend/controller.js)
- [backend/prModel.js](backend/prModel.js)
- [backend/github.js](backend/github.js)
- [backend/docker-compose.yaml](backend/docker-compose.yaml)
- [frontend/package.json](frontend/package.json)
- [frontend/vite.config.ts](frontend/vite.config.ts)
- [frontend/tsconfig.json](frontend/tsconfig.json)
- [frontend/tsconfig.node.json](frontend/tsconfig.node.json)

## Prerequisites

- Node.js 18+ and npm
- Git
- Docker Desktop (optional, for containerized run)
- MongoDB (if running backend locally without Docker)
- A GitHub Personal Access Token (PAT) with repo permissions

## Environment Variables

Create a `.env` file in [backend/](backend/) with:

- **`PORT`**: Backend port (default 3000)
- **`MONGO_URI`**: MongoDB connection string
- **`GITHUB_TOKEN`**: GitHub PAT for REST API (merges, PR files)
- **`GITHUB_REPO_OWNER`**: Repository owner (org or username)
- **`GITHUB_REPO_NAME`**: Repository name
- **`GITHUB_TOKEN_AI`**: GitHub PAT for GitHub Models API (AI reviews)

Note: Docker Compose in [backend/docker-compose.yaml](backend/docker-compose.yaml) expects an `.env` alongside it.

## Quick Start (Local, no Docker)

1. Start MongoDB locally or use a hosted MongoDB; set `MONGO_URI` accordingly.
2. Backend:
   ```bash
   cd backend
   npm install
   # Create .env with the variables above
   npm start
   ```
   - Server runs on `http://localhost:3000`.
3. Frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   - Open `http://localhost:5173`.

## Quick Start (Docker Compose)

From the backend folder:

```bash
cd backend
# Ensure backend/.env has required variables
docker compose build --no-cache
docker compose up -d
```

- Services started:
  - `mongodb` on `27017`
  - `backend` on `3000`
  - `frontend` on `80` (serves built static app via NGINX)
- Open `http://localhost/` (or your server’s public IP).

Rebuild just the frontend:

```bash
cd backend
docker compose build --no-cache frontend
docker compose up -d
```

## Frontend Notes

- Dev server: `npm run dev` (Vite, default port 5173).
- Production image: built via [frontend/Dockerfile](frontend/Dockerfile), served by NGINX on port 80.
- TypeScript config for Vite build uses Node types in [frontend/tsconfig.node.json](frontend/tsconfig.node.json). Ensure `@types/node` is installed.

## Backend API

- `POST /webhook` — GitHub webhook handler for PR events and CI updates
- `GET /prs` — List stored PRs
- `POST /approve/:prNumber` — Approve and merge PR (requires `GITHUB_TOKEN`, repo owner/name)
- `POST /reject/:prNumber` — Mark PR as rejected

## GitHub Integration

- Ensure your GitHub repository sends webhooks to your backend’s `/webhook` endpoint.
- The app uses:
  - [backend/github.js](backend/github.js) for PR file diffs and merging
  - [backend/openaiService/openaiservice.js](backend/openaiService/openaiservice.js) for AI review via GitHub Models API

## IaC (Terraform)

In [iaac/](iaac/):

```bash
cd iaac
terraform init
terraform apply --auto-approve
```

- Set your cloud provider credentials (e.g., AWS) before applying.
- Outputs may include instance IPs or resource IDs; adjust security groups to allow ports 80/3000/27017 if needed.

## Troubleshooting

- Docker build fails with TypeScript node types missing:
  - Install types: `npm install --save-dev @types/node` in [frontend/](frontend/)
- Port conflicts (80/3000/27017):
  - Adjust `ports:` in [backend/docker-compose.yaml](backend/docker-compose.yaml)
- `favicon.ico` 404 in NGINX logs:
  - Add `frontend/public/favicon.ico`; Vite will include it in `dist`.
- Webhook doesn’t trigger:
  - Verify GitHub webhooks, secret, and reachable backend URL (public IP + port).

## Development Tips

- Use `.env.example` to document expected env vars; keep real `.env` out of VCS.
- Consider adding CORS origins to match your frontend URL.
- For client-side routing, use an NGINX SPA fallback replacing default config to serve `index.html` on unknown routes.

---

Maintained in this repo. Contributions welcome.
