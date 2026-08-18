#!/bin/bash
# ==============================================================================
# TechMarket BD — Production Zero-Downtime Deployment Script for aaPanel
# Domain: techmarket.com.bd
# Path:   /www/wwwroot/techmarket.com.bd
# Usage:  bash deploy.sh
# ==============================================================================

set -e

echo "🚀 Starting Production Deployment for techmarket.com.bd..."

# 0. Fix Git Safe Directory for aaPanel root/www users
git config --global --add safe.directory /www/wwwroot/techmarket.com.bd 2>/dev/null || true
git config --global --add safe.directory "*" 2>/dev/null || true

# 1. Update Codebase from GitHub Repository
REPO_URL="https://github.com/sahabuddin123/techmarket.git"

if [ ! -d ".git" ]; then
    echo "⚙️ Initializing Git repository and linking to GitHub..."
    git init
    git remote add origin "$REPO_URL" || git remote set-url origin "$REPO_URL"
    git fetch origin main
    git checkout -f -B main origin/main
else
    echo "📦 Pulling latest production code from GitHub ($REPO_URL)..."
    git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"
    git fetch origin main
    git reset --hard origin/main
fi

# 2. Install/Update PHP Dependencies without dev overhead
if command -v composer &> /dev/null; then
    echo "🐘 Installing Composer production dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
elif [ -f "/usr/local/bin/composer" ]; then
    echo "🐘 Installing Composer production dependencies via /usr/local/bin/composer..."
    php /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction
else
    echo "ℹ️ Composer command not found in global PATH, skipping composer install..."
fi

# 3. Build Production React/Inertia/Vite Bundle
echo "⚡ Building Frontend Assets with Vite..."
rm -f public/hot
npm ci --silent || npm install --silent
chmod -R +x node_modules/.bin 2>/dev/null || true
npm run build
rm -f public/hot

# 4. Run Database Migrations
echo "🗄️ Running Database Migrations..."
php artisan migrate --force

# 5. Clear Old Caches & Generate High-Speed Production Caches
echo "⚡ Generating Optimized Laravel Caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 6. Ensure Storage Public Symlink
php artisan storage:link || true

# 7. Set Strict Permissions for aaPanel 'www' User
echo "🔒 Fixing file and folder permissions for aaPanel www user..."
chown -R www:www . 2>/dev/null || true
find . -type f -not -name '.user.ini' -exec chmod 644 {} \; 2>/dev/null || true
find . -type d -exec chmod 755 {} \; 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true
chmod -R +x node_modules/.bin 2>/dev/null || true
chmod +x deploy.sh 2>/dev/null || true

# 8. Restart Background Queue Workers
echo "🔄 Restarting Background Queue Workers..."
php artisan queue:restart

echo "✅ Production Deployment for https://techmarket.com.bd Completed Successfully!"
