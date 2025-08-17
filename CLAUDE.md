# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Setup
```bash
# Start PostgreSQL database (required before development)
docker-compose up -d

# Apply database migrations
npx prisma migrate dev

# Generate Prisma client (after schema changes)
npx prisma generate

# Access database directly
docker-compose exec postgres psql -U postgres -d contribute_to_small_projects

# Stop database
docker-compose down
```

### Development
```bash
# Start development server (requires database to be running)
npm run dev

# Build application
npm run build

# Lint code
npm run lint

# Manually populate database with repositories (for testing)
curl -X POST http://localhost:3000/api/fetch \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Architecture Overview

### Core Purpose
This application curates GitHub repositories with 100-600 stars to help developers find suitable projects for their first open source contributions. It automatically fetches and updates repository data daily via Vercel Cron.

### Data Flow Architecture
1. **Vercel Cron** triggers `/api/fetch` daily at midnight with Bearer token authentication
2. **GitHubClient** (`lib/github.ts`) searches GitHub for repos with 100-600 stars using GitHub API
3. **Repository data** is upserted into PostgreSQL via Prisma ORM (prevents duplicates via `githubUrl` unique constraint)
4. **Frontend** displays repositories by fetching from `/api/repos` (public endpoint)

### Key Components

#### Database Layer
- **Prisma schema**: Single `Repository` model with GitHub metadata (owner, name, stars, language, etc.)
- **PostgreSQL**: Runs locally via Docker Compose (postgres:17)
- **Unique constraint**: `githubUrl` prevents duplicate repositories

#### API Layer
- **`/api/fetch` (POST)**: Protected endpoint for cron jobs, requires `CRON_SECRET` Bearer token
- **`/api/repos` (GET)**: Public endpoint returning all repositories sorted by stars/last_updated
- **GitHubClient**: Encapsulates GitHub API search with rate limiting and error handling

#### Frontend Layer
- **Next.js 15 App Router**: Server-side rendering for performance
- **RepoCard component**: Displays repository info (stars, language, description, GitHub link)
- **Responsive grid layout**: Uses Tailwind CSS for clean, accessible design

### Security Model
- `/api/fetch` endpoint is protected by Bearer token authentication (`CRON_SECRET`)
- GitHub API access via personal access token (`GITHUB_TOKEN`)
- Environment variables required: `DATABASE_URL`, `GITHUB_TOKEN`, `CRON_SECRET`

### Deployment Configuration
- **vercel.json**: Configures daily cron job (0 0 * * *) to hit `/api/fetch`
- **Docker**: Local development uses Docker Compose for PostgreSQL
- **Vercel**: Production deployment with managed PostgreSQL and cron scheduling