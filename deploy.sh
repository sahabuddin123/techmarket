#!/usr/bin/env bash

# ==============================================================================
# TechMarket BD - Production Automated Deployment Script (aaPanel & Linux VPS)
# ==============================================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ==============================================================================
#test
set -e

echo ""
echo "======================================================================"
echo "🚀 Starting Deployment for TechMarket BD..."
echo "======================================================================"

# 1. AUTO-DETECT AAPANEL PHP 8.3 / CLEAN PHP BINARY
PHP_BIN=""
for candidate in \
    "/www/server/php/83/bin/php" \
    "/www/server/php/82/bin/php" \
    "/usr/bin/php8.3" \
    "/usr/bin/php8.2" \
    "/www/server/php/81/bin/php" \
    "$(which php 2>/dev/null)"
do
    if [ -x "$candidate" ]; then
        PHP_BIN="$candidate"
        break
    fi
done

if [ -z "$PHP_BIN" ]; then
    echo "❌ Error: PHP binary could not be detected. Please ensure PHP is installed."
    exit 1
fi

echo "✔ Using PHP Binary: $PHP_BIN ($("$PHP_BIN" -r 'echo PHP_VERSION;'))"

# 2. AUTO-DETECT COMPOSER BINARY
COMPOSER_PATH=""
for candidate in \
    "/www/server/php/83/bin/composer" \
    "/usr/local/bin/composer" \
    "/usr/bin/composer" \
    "$(which composer 2>/dev/null)"
do
    if [ -f "$candidate" ] || [ -x "$candidate" ]; then
        COMPOSER_PATH="$candidate"
        break
    fi
done

echo "✔ Using Composer at: $COMPOSER_PATH"

# Safe PHP Runner (Forces 1GB memory and runs via aaPanel clean PHP 8.3)
PHP_RUN="$PHP_BIN -d memory_limit=1024M"

# 3. GIT PULL LATEST COMMITS
echo ""
echo "📦 Pulling latest changes from repository (main branch)..."
git fetch --all
git reset --hard origin/main
git pull origin main

# 4. COMPOSER DEPENDENCIES (Executed via clean PHP 8.3 to bypass swow CLI bugs)
echo ""
echo "📦 Verifying and installing backend PHP dependencies (including Predis)..."
export COMPOSER_ALLOW_SUPERUSER=1

if [ -n "$COMPOSER_PATH" ]; then
    $PHP_RUN "$COMPOSER_PATH" install --no-dev --no-interaction --prefer-dist --optimize-autoloader || {
        echo "⚠️ Running autoload generation fallback..."
        $PHP_RUN "$COMPOSER_PATH" dump-autoload -o || true
    }
fi

# 5. SAFE DATABASE MIGRATIONS
echo ""
echo "🗄 Running database migrations safely (preserving existing data)..."
$PHP_RUN artisan migrate --force

# 5b. SEED DEFAULT NOTIFICATION RULES IF NOT PRESENT
echo "🔔 Ensuring Notification Rules are active in database..."
$PHP_RUN artisan db:seed --class=NotificationRulesSeeder --force || true

# 5c. SYNC STOREFRONT HERO PROMO BANNERS
echo "🖼 Syncing Homepage Hero Side Banners..."
$PHP_RUN artisan tinker --execute="\App\Models\Banner::updateOrCreate(['placement' => 'side_banner_top'], ['title' => 'Next-Level Gaming Gear', 'subtitle' => 'Ultra-performance laptops, RTX graphics cards, and pro peripherals.', 'badge' => 'TOP DEALS', 'image' => '/images/storefront/v3/side_banner_gaming_laptops.jpg', 'placement' => 'side_banner_top', 'button_text' => 'Shop Gaming Gear', 'button_url' => '/category/laptop', 'is_active' => true, 'sort_order' => 1]); \App\Models\Banner::updateOrCreate(['placement' => 'side_banner_bottom'], ['title' => 'Revolutionize Your Security', 'subtitle' => 'Advanced AI-powered 4K CCTV surveillance and smart home monitoring.', 'badge' => 'CCTV & SECURITY', 'image' => '/images/storefront/v3/side_banner_smart_cctv.jpg', 'placement' => 'side_banner_bottom', 'button_text' => 'Explore CCTV', 'button_url' => '/cctv-estimator', 'is_active' => true, 'sort_order' => 2]);" || true

# 6. STORAGE LINK
echo ""
echo "🔗 Verifying storage symlink..."
$PHP_RUN artisan storage:link || true

# 6b. RESTART BACKGROUND QUEUE WORKERS
$PHP_RUN artisan queue:restart || true

# 7. OPTIMIZE & CLEAR APPLICATION CACHES (Redis Cache & Config)
echo ""
echo "⚡ Optimizing application performance & caching configurations..."
$PHP_RUN artisan optimize:clear
$PHP_RUN artisan config:cache
$PHP_RUN artisan route:cache
$PHP_RUN artisan view:cache

# 8. RUN IMAGE OPTIMIZER
echo ""
echo "🖼 Running Enterprise Image Optimizer..."
$PHP_RUN artisan media:optimize || true

# 9. PERMISSIONS HARDENING
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
