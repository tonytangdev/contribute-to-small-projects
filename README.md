# Contribute to Small Projects

Discover open source projects with 100-600 stars - perfect for your first contributions to open source!

This Next.js application automatically fetches repositories from GitHub that fall within the ideal contribution range and displays them in a clean, accessible interface.

## Features

- 🚀 **Daily Auto-Updates**: Automatically fetches new repositories via Vercel Cron
- 🎯 **Curated Selection**: Projects with 100-600 stars (perfect contribution size)
- 📱 **Responsive Design**: Clean interface built with Tailwind CSS
- 🔒 **Secure**: Protected cron endpoints with Bearer token authentication
- ⚡ **Fast**: Built with Next.js 15+ App Router and PostgreSQL

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel with Cron Jobs
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- GitHub Personal Access Token

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   - `DATABASE_URL`: Already configured for Docker setup
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token
   - `CRON_SECRET`: Secret key for cron authentication

4. Start PostgreSQL database with Docker:
   ```bash
   docker-compose up -d
   ```

5. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to see the app

### Docker Commands

- Start PostgreSQL: `docker-compose up -d`
- Stop PostgreSQL: `docker-compose down`
- View logs: `docker-compose logs postgres`
- Access PostgreSQL CLI: `docker-compose exec postgres psql -U postgres -d contribute_to_small_projects`

### Initial Data Fetch

To populate the database with repositories, you can manually trigger the fetch endpoint:

```bash
curl -X POST http://localhost:3000/api/fetch \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `GITHUB_TOKEN` 
   - `CRON_SECRET`
4. Deploy!

The cron job will automatically run daily at midnight to fetch new repositories.

## API Endpoints

- `GET /api/repos` - Fetch all repositories (public)
- `POST /api/fetch` - Fetch repositories from GitHub (protected, cron only)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
