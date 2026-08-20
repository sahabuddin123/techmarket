#!/bin/bash

# ==============================================================================
# TechMarket BD - Live Production Deployment Script
# ==============================================================================

set -e

echo "🚀 Starting Live Production Deployment for TechMarket BD..."

# 1. Enter Maintenance Mode (Optional for zero downtime or safe deployment)
# php artisan down --render="errors::503" --secret="techmarket-bypass-2026"

# 2. Pull Latest Changes from Git (if using git on server)
if [ -d ".git" ]; then
    echo "📦 Pulling latest changes from repository..."
    git pull origin main || git pull origin master
fi

# 3. Install/Update Composer Dependencies for Production
echo "🐘 Installing Composer Dependencies (No Dev, Optimized)..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# 4. Install Node Dependencies & Build Production Assets
echo "⚡ Building Frontend Production Assets (Vite + React + Inertia)..."
if command -v npm &> /dev/null; then
    npm ci || npm install
    npm run build
fi

# 5. Run Database Migrations
echo "🗄️ Running Database Migrations..."
php artisan migrate --force

# 6. Ensure Storage Symlink Exists
echo "🔗 Ensuring Storage Symlink..."
php artisan storage:link || true

# 7. Optimize Caches for High-Performance Production
echo "⚡ Clearing and Optimizing Laravel Caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 8. Set Safe Production File Permissions
echo "🔒 Securing Directory Permissions..."
chmod -R 775 storage bootstrap/cache || true
# chown -R www-data:www-data storage bootstrap/cache || true

# 9. Restart Background Queue Workers
echo "🔄 Restarting Queue Workers..."
php artisan queue:restart || true

# 10. Exit Maintenance Mode
# php artisan up

echo "✅ Live Production Deployment Completed Successfully!"
