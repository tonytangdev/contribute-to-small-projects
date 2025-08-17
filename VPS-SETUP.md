# VPS Deployment Guide

This guide explains how to deploy the repository fetcher on your Hostinger VPS using Docker Compose.

## Prerequisites

- Hostinger VPS with Docker and Docker Compose installed
- GitHub Personal Access Token
- Git installed on VPS

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tonytangdev/contribute-to-small-projects.git
cd contribute-to-small-projects
```

### 2. Setup Environment Variables

```bash
cp .env.vps .env
nano .env
```

Edit the `.env` file with your credentials:
```env
GITHUB_TOKEN=ghp_your_actual_github_token_here
CRON_SECRET=your_secure_random_string
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Note**: Replace the DATABASE_URL with your actual Supabase connection string.

### 3. Deploy with Docker Compose

```bash
# Start all services (database + cron + web app)
docker-compose -f docker-compose.vps.yml up -d

# Check if containers are running
docker-compose -f docker-compose.vps.yml ps

# View logs
docker-compose -f docker-compose.vps.yml logs -f
```

### 4. Initialize Database (Optional)

Since you're using Supabase, the database should already be set up. If you need to run migrations:

```bash
# Run database migrations (only if needed)
docker-compose -f docker-compose.vps.yml exec app npx prisma migrate deploy

# Generate Prisma client (usually done during build)
docker-compose -f docker-compose.vps.yml exec app npx prisma generate
```

### 5. Test the Setup

```bash
# Run the fetcher script manually to test
docker-compose -f docker-compose.vps.yml exec repository-fetcher node scripts/fetch-repositories.js

# Check cron logs
docker-compose -f docker-compose.vps.yml logs repository-fetcher
```

## Services Overview

The Docker Compose setup includes:

1. **repository-fetcher**: Cron service that runs the fetch script daily at 2 AM
2. **app**: Next.js web application (optional)

**Note**: Uses your Supabase PostgreSQL database instead of a local database.

## Cron Schedule

The repository fetcher runs automatically every day at 2:00 AM server time. You can modify the schedule in `scripts/crontab`:

```cron
# Current: Daily at 2 AM
0 2 * * * cd /app && node scripts/fetch-repositories.js >> /var/log/cron/fetch-repositories.log 2>&1

# Examples:
# Every 6 hours: 0 */6 * * *
# Twice daily: 0 2,14 * * *
```

## Monitoring

### Check Cron Logs
```bash
# Follow live logs
docker-compose -f docker-compose.vps.yml logs -f repository-fetcher

# View cron execution logs
docker-compose -f docker-compose.vps.yml exec repository-fetcher cat /var/log/cron/fetch-repositories.log
```

### Check Database
```bash
# Connect to Supabase database (you can also use the Supabase dashboard)
docker-compose -f docker-compose.vps.yml exec app npx prisma studio

# Or use Prisma CLI to check data
docker-compose -f docker-compose.vps.yml exec app npx prisma db seed
```

## Manual Operations

### Run Fetch Script Manually
```bash
docker-compose -f docker-compose.vps.yml exec repository-fetcher node scripts/fetch-repositories.js
```

### Update Code
```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up -d --build
```

### Database Operations
```bash
# Backup/restore is handled by Supabase
# Use Supabase dashboard for database management
# Or use Prisma for schema operations
docker-compose -f docker-compose.vps.yml exec app npx prisma db push
```

## Troubleshooting

### Container Issues
```bash
# Check container status
docker-compose -f docker-compose.vps.yml ps

# View logs for specific service
docker-compose -f docker-compose.vps.yml logs repository-fetcher
docker-compose -f docker-compose.vps.yml logs app
```

### Cron Not Running
```bash
# Check if cron is running in container
docker-compose -f docker-compose.vps.yml exec repository-fetcher ps aux | grep cron

# Check crontab
docker-compose -f docker-compose.vps.yml exec repository-fetcher crontab -l
```

### Database Connection Issues
```bash
# Test Supabase database connection
docker-compose -f docker-compose.vps.yml exec app npx prisma db pull

# Test connection with simple query
docker-compose -f docker-compose.vps.yml exec repository-fetcher node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.repository.count().then(count => console.log('Repository count:', count)).finally(() => prisma.\$disconnect());
"
```

## Security Notes

- Database connection goes through Supabase's secure connection (SSL enabled)
- Make sure your `.env` file is not committed to version control
- Keep your Supabase credentials secure
- Consider using Docker secrets for production deployments
- The web app is exposed on port 3000 - use a reverse proxy (nginx) for production

## Resource Usage

The setup is optimized for VPS deployment:
- **Memory**: ~200MB total for all containers
- **Storage**: Database grows ~1MB per 1000 repositories
- **Network**: ~50MB/day for GitHub API calls
- **CPU**: Minimal usage except during daily fetch (2-5 minutes)

## Next Steps

1. Set up nginx reverse proxy for the web app
2. Configure domain and SSL certificates
3. Set up monitoring/alerting for failed cron jobs
4. Consider database backups to external storage