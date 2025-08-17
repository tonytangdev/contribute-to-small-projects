# Deployment Guide

## Supabase Database Setup ✅

Your Supabase database has been successfully configured:
- Database migrations have been applied
- Tables created: `repositories`
- Connection tested and working

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables:

### Required Variables:
```
DATABASE_URL=postgresql://postgres:Ot4sCnf9ZZ7ZltvN@db.pqkmbseysccyjtbticoj.supabase.co:5432/postgres
CRON_SECRET=bcfb29320a098752e55952c93a3ddf1f49770b69d85e8814e99a65f757468ae2
GITHUB_TOKEN=your_github_token_here
```

### Steps to Deploy:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository: `tonytangdev/contribute-to-small-projects`
3. Add the environment variables above in the deployment settings
4. Deploy!

### After Deployment:
1. Your cron job will automatically fetch repositories daily
2. You can manually trigger it with: `POST /api/fetch` with Authorization header
3. The app will be live and ready to use!

## Database Schema
- **repositories**: Stores GitHub repository data
  - id, name, owner, description, language, stars, contributors
  - githubUrl (unique), lastUpdated, createdAt, updatedAt

## Features Available:
- ✅ Repository discovery with 100-600 stars
- ✅ Search by name/description  
- ✅ Filter by programming language
- ✅ Contributors count display
- ✅ Modern responsive UI
- ✅ Server-side pagination
- ✅ Daily auto-updates via cron