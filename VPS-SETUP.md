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

Edit the `.env` file and add your GitHub token:
```env
GITHUB_TOKEN=ghp_your_actual_github_token_here
CRON_SECRET=your_secure_random_string
```

### 3. Deploy with Docker Compose

```bash
# Start all services (database + cron + web app)
docker-compose -f docker-compose.vps.yml up -d

# Check if containers are running
docker-compose -f docker-compose.vps.yml ps

# View logs
docker-compose -f docker-compose.vps.yml logs -f
```

### 4. Initialize Database

```bash
# Run database migrations
docker-compose -f docker-compose.vps.yml exec app npx prisma migrate deploy

# Or reset database if needed
docker-compose -f docker-compose.vps.yml exec app npx prisma migrate reset --force
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

1. **postgres**: PostgreSQL 17 database
2. **repository-fetcher**: Cron service that runs the fetch script daily at 2 AM
3. **app**: Next.js web application (optional)

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
# Connect to database
docker-compose -f docker-compose.vps.yml exec postgres psql -U postgres -d contribute_to_small_projects

# Count repositories
SELECT COUNT(*) FROM "Repository";

# Recent repositories
SELECT name, owner, stars, "lastUpdated" FROM "Repository" ORDER BY "lastUpdated" DESC LIMIT 10;
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

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.vps.yml exec postgres pg_dump -U postgres contribute_to_small_projects > backup.sql

# Restore backup
docker-compose -f docker-compose.vps.yml exec -T postgres psql -U postgres contribute_to_small_projects < backup.sql
```

## Troubleshooting

### Container Issues
```bash
# Check container status
docker-compose -f docker-compose.vps.yml ps

# View logs for specific service
docker-compose -f docker-compose.vps.yml logs repository-fetcher
docker-compose -f docker-compose.vps.yml logs postgres
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
# Test database connection
docker-compose -f docker-compose.vps.yml exec app npx prisma db pull

# Check database logs
docker-compose -f docker-compose.vps.yml logs postgres
```

## Security Notes

- The PostgreSQL database is only accessible from within the Docker network
- Make sure your `.env` file is not committed to version control
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