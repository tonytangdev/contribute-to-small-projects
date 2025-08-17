#!/bin/sh

# Ensure cron log directory exists
mkdir -p /var/log/cron

echo "Testing database connection..."
cd /app

# Simple connection test with retry
for i in 1 2 3; do
  echo "Database connection attempt $i/3..."
  timeout 30 node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1 as test\`
  .then(result => {
    console.log('✓ Database connection successful');
    return prisma.\$disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });
" && break || {
    echo "Attempt $i failed, retrying in 5 seconds..."
    sleep 5
  }
done

if [ $? -ne 0 ]; then
  echo "✗ All database connection attempts failed"
  exit 1
fi

echo "✓ Database test passed"

echo "Starting cron daemon..."

# Ensure crontab is loaded
crontab /etc/crontabs/root

# Start cron and keep it running
while true; do
  crond -f &
  CRON_PID=$!
  wait $CRON_PID
  echo "Cron died, restarting..."
  sleep 5
done