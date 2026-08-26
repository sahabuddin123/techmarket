#!/usr/bin/env bash

# ==============================================================================
# TechMarket BD - Production Automated Deployment Script (aaPanel & Linux VPS)
# ==============================================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ==============================================================================

set -e

echo ""
echo "======================================================================"
echo "🚀 Starting Deployment for TechMarket BD..."
echo "======================================================================"

# 1. AUTO-DETECT AAPANEL / SYSTEM PHP BINARY
PHP_BIN=""
for candidate in \
    "/www/server/php/83/bin/php" \
    "/www/server/php/82/bin/php" \
    "/www/server/php/81/bin/php" \
    "/www/server/php/84/bin/php" \
    "$(which php 2>/dev/null)"
do
    if [ -x "$candidate" ]; then
        # Verify candidate supports mbstring
        if "$candidate" -r 'exit(function_exists("mb_split") ? 0 : 1);' 2>/dev/null; then
            PHP_BIN="$candidate"
            break
        fi
    fi
done

# Fallback if no candidate with mbstring found
if [ -z "$PHP_BIN" ]; then
    for candidate in \
        "/www/server/php/83/bin/php" \
        "/www/server/php/82/bin/php" \
        "$(which php 2>/dev/null)"
    do
        if [ -x "$candidate" ]; then
            PHP_BIN="$candidate"
            break
        fi
    done
fi

if [ -z "$PHP_BIN" ]; then
    echo "❌ Error: PHP binary could not be detected. Please ensure PHP is installed."
    exit 1
fi

echo "✔ Using PHP Binary: $PHP_BIN ($("$PHP_BIN" -r 'echo PHP_VERSION;'))"

# 2. AUTO-DETECT COMPOSER BINARY
COMPOSER_BIN=""
for candidate in \
    "/www/server/php/83/bin/composer" \
    "/www/server/php/82/bin/composer" \
    "/usr/local/bin/composer" \
    "/usr/bin/composer" \
    "$(which composer 2>/dev/null)"
do
    if [ -x "$candidate" ]; then
        COMPOSER_BIN="$candidate"
        break
    fi
done

if [ -z "$COMPOSER_BIN" ]; then
    COMPOSER_BIN="$PHP_BIN /usr/bin/composer"
fi

echo "✔ Using Composer: $COMPOSER_BIN"

# 3. GIT PULL LATEST COMMITS
echo ""
echo "📦 Pulling latest changes from repository (main branch)..."
git fetch --all
git reset --hard origin/main
git pull origin main

# 4. COMPOSER DEPENDENCIES
echo ""
echo "📦 Installing backend PHP dependencies..."
export COMPOSER_ALLOW_SUPERUSER=1
$PHP_BIN $COMPOSER_BIN install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# 5. SAFE DATABASE MIGRATIONS
echo ""
echo "🗄 Running database migrations safely (preserving existing data)..."
$PHP_BIN artisan migrate --force

# 6. STORAGE LINK
echo ""
echo "🔗 Verifying storage symlink..."
$PHP_BIN artisan storage:link || true

# 7. OPTIMIZE & CLEAR APPLICATION CACHES
echo ""
echo "⚡ Optimizing application performance & clearing caches..."
$PHP_BIN artisan optimize:clear
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache

# 8. PERMISSIONS HARDENING
echo ""
echo "🔒 Updating storage and bootstrap cache permissions..."
chmod -R 775 storage bootstrap/cache || true
if id "www" &>/dev/null; then
    chown -R www:www storage bootstrap/cache || true
elif id "www-data" &>/dev/null; then
    chown -R www-data:www-data storage bootstrap/cache || true
fi

echo ""
echo "======================================================================"
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "✨ TechMarket BD is running with latest features & secure database state."
echo "======================================================================"
echo ""
