#!/bin/bash

# ==============================================================================
# TechMarket BD - Automated Live Production Deployment Script
# ==============================================================================

set -e

echo "🚀 [1/7] Starting Live Production Deployment for TechMarket BD..."

# Auto-detect PHP binary
PHP_BIN="php"
if command -v /usr/local/lsws/lsphp83/bin/php &> /dev/null; then
    PHP_BIN="/usr/local/lsws/lsphp83/bin/php"
elif command -v /usr/local/lsws/lsphp82/bin/php &> /dev/null; then
    PHP_BIN="/usr/local/lsws/lsphp82/bin/php"
elif command -v /www/server/php/83/bin/php &> /dev/null; then
    PHP_BIN="/www/server/php/83/bin/php"
elif command -v /www/server/php/82/bin/php &> /dev/null; then
    PHP_BIN="/www/server/php/82/bin/php"
elif command -v php8.3 &> /dev/null; then
    PHP_BIN="php8.3"
elif command -v php8.2 &> /dev/null; then
    PHP_BIN="php8.2"
fi

echo "ℹ️ Using PHP Binary: $($PHP_BIN -v 2>/dev/null | head -n 1 || echo $PHP_BIN)"

# Auto-detect or download Composer
COMPOSER_BIN="composer"
if ! command -v composer &> /dev/null; then
    if [ -f "/usr/local/bin/composer" ]; then
        COMPOSER_BIN="/usr/local/bin/composer"
    elif [ -f "./composer.phar" ]; then
        COMPOSER_BIN="$PHP_BIN ./composer.phar"
    else
        echo "📥 Composer not found globally, downloading composer.phar..."
        curl -sS https://getcomposer.org/installer | $PHP_BIN
        COMPOSER_BIN="$PHP_BIN ./composer.phar"
    fi
else
    COMPOSER_BIN="$PHP_BIN $(which composer)"
fi

# 1. Pull Latest Changes from Git
if [ -d ".git" ]; then
    echo "📦 [2/7] Pulling latest code from GitHub..."
    git fetch --all
    git reset --hard origin/main || git reset --hard origin/master
fi

# 2. Install/Update Composer Dependencies for Production
echo "🐘 [3/7] Installing Composer Dependencies..."
$COMPOSER_BIN install --no-dev --no-interaction --prefer-dist --optimize-autoloader || true

# 3. Build Frontend Assets (if npm is available)
echo "⚡ [4/7] Checking Frontend Build..."
if command -v npm &> /dev/null; then
    echo "🔨 Running npm build..."
    npm run build || true
fi

# 4. Run Database Migrations
echo "🗄️ [5/7] Running Database Migrations..."
$PHP_BIN artisan migrate --force

# 5. Clear and Cache System
echo "⚡ [6/7] Optimizing Laravel Caches..."
$PHP_BIN artisan optimize:clear || true
$PHP_BIN artisan optimize || true
$PHP_BIN artisan storage:link || true
$PHP_BIN artisan queue:restart || true

# 6. Set Directory Permissions (supports www, www-data, nobody)
echo "🔒 [7/7] Fixing Storage & Cache Permissions..."
chmod -R 775 storage bootstrap/cache || true
if id "www" &>/dev/null; then
    chown -R www:www storage bootstrap/cache || true
elif id "www-data" &>/dev/null; then
    chown -R www-data:www-data storage bootstrap/cache || true
fi

echo "================================================================"
echo "🎉 SUCCESS: TechMarket BD Live Deployment Completed Successfully!"
echo "================================================================"
