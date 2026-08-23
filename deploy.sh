#!/bin/bash

# ==============================================================================
# TechMarket BD - Automated Live Production Deployment Script (aaPanel / Linux)
# ==============================================================================

set -e

echo "================================================================"
echo "🚀 [1/7] Starting Live Production Deployment for TechMarket BD..."
echo "================================================================"

# 1. Smart PHP Binary Auto-Detection (aaPanel / LiteSpeed / Native with mbstring validation)
PHP_BIN=""
CANDIDATES=(
    "/www/server/php/84/bin/php"
    "/www/server/php/83/bin/php"
    "/www/server/php/82/bin/php"
    "/usr/local/lsws/lsphp84/bin/php"
    "/usr/local/lsws/lsphp83/bin/php"
    "/usr/local/lsws/lsphp82/bin/php"
    "php8.4"
    "php8.3"
    "php8.2"
    "php"
)

for candidate in "${CANDIDATES[@]}"; do
    if command -v "$candidate" &> /dev/null; then
        # Check if this PHP binary has required mbstring (mb_split)
        if "$candidate" -r 'exit(function_exists("mb_split") ? 0 : 1);' 2>/dev/null; then
            PHP_BIN="$candidate"
            break
        fi
    fi
done

# Fallback to standard command if all candidate tests fail
if [ -z "$PHP_BIN" ]; then
    for candidate in "${CANDIDATES[@]}"; do
        if command -v "$candidate" &> /dev/null; then
            PHP_BIN="$candidate"
            break
        fi
    done
fi

PHP_BIN="${PHP_BIN:-php}"
echo "ℹ️ Using Validated PHP Binary: $PHP_BIN ($($PHP_BIN -v 2>/dev/null | head -n 1 || echo 'Active PHP'))"

# 2. Auto-detect Composer
COMPOSER_BIN="composer"
if [ -f "/usr/local/bin/composer" ]; then
    COMPOSER_BIN="$PHP_BIN /usr/local/bin/composer"
elif [ -f "./composer.phar" ]; then
    COMPOSER_BIN="$PHP_BIN ./composer.phar"
elif command -v composer &> /dev/null; then
    COMPOSER_BIN="$PHP_BIN $(which composer)"
else
    echo "📥 Downloading composer.phar..."
    curl -sS https://getcomposer.org/installer | $PHP_BIN
    COMPOSER_BIN="$PHP_BIN ./composer.phar"
fi

# 3. Pull Latest Changes from Git
if [ -d ".git" ]; then
    echo "📦 [2/7] Pulling latest updates from GitHub..."
    git fetch --all
    git reset --hard origin/main || git reset --hard origin/master
fi

# 4. Install/Update Composer Dependencies for Production
echo "🐘 [3/7] Optimizing Composer Autoloader..."
$COMPOSER_BIN install --no-dev --no-interaction --prefer-dist --optimize-autoloader || true

# 5. Build Frontend Assets (if npm is present and needed)
echo "⚡ [4/7] Verifying Frontend Assets..."
if command -v npm &> /dev/null && [ ! -d "public/build" ]; then
    echo "🔨 Building frontend..."
    npm run build || true
fi

# 6. Run Database Migrations
echo "🗄️ [5/7] Running Database Migrations (CCTV, Analytics & Reports)..."
$PHP_BIN artisan migrate --force

# 7. Clear and Rebuild Laravel Caches
echo "⚡ [6/7] Optimizing Laravel Caches..."
$PHP_BIN artisan optimize:clear || true
$PHP_BIN artisan config:cache || true
$PHP_BIN artisan route:cache || true
$PHP_BIN artisan view:cache || true
$PHP_BIN artisan storage:link || true
$PHP_BIN artisan queue:restart || true

# 8. Set Strict aaPanel Permissions (www:www)
echo "🔒 [7/7] Fixing Storage & Bootstrap Permissions for aaPanel (www)..."
chmod -R 775 storage bootstrap/cache || true
if id "www" &>/dev/null; then
    chown -R www:www storage bootstrap/cache || true
elif id "www-data" &>/dev/null; then
    chown -R www-data:www-data storage bootstrap/cache || true
fi

echo "================================================================"
echo "🎉 SUCCESS: TechMarket BD Live Deployment Completed Successfully!"
echo "================================================================"
