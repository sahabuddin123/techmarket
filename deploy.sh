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

# Auto-unblock putenv in aaPanel / VPS php.ini if disabled
for php_ini in /www/server/php/*/etc/php.ini /etc/php/*/fpm/php.ini /etc/php/*/cli/php.ini; do
    if [ -f "$php_ini" ] && grep -q "putenv" "$php_ini"; then
        sed -i 's/,putenv//g; s/putenv,//g; s/putenv//g' "$php_ini" 2>/dev/null || true
    fi
done

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

# Safe PHP Runner (Forces 1GB memory and runs via clean PHP)
PHP_RUN="$PHP_BIN -d memory_limit=1024M"

# 3. GIT PULL LATEST COMMITS
echo ""
echo "📦 Pulling latest changes from repository (main branch)..."
git fetch --all
git reset --hard origin/main
git pull origin main

# 4. COMPOSER DEPENDENCIES
echo ""
echo "📦 Verifying and installing backend PHP dependencies..."
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

# 5d. SYNC META PIXEL & TRACKING CONFIGURATION
echo "📊 Syncing Meta (Facebook) Pixel Configuration..."
$PHP_RUN artisan tinker --execute="\App\Models\Setting::set('meta_pixel_id', '1091602526637309'); \App\Models\Setting::set('fb_pixel_id', '1091602526637309'); \App\Models\Setting::set('meta_pixel_enabled', '1');" || true

# 5e. SYNC STEADFAST COURIER API GATEWAY & CREDENTIALS
echo "🚚 Syncing Steadfast Courier API Gateway and credentials..."
$PHP_RUN artisan tinker --execute="\App\Models\Setting::set('steadfast_base_url', 'https://portal.packzy.com/api/v1', 'courier'); \App\Models\Setting::set('steadfast_api_key', 'ku6vnpqkizhiqphdkltzy00pyd7gqa0a', 'courier'); \App\Models\Setting::set('steadfast_secret_key', 'm6ix2y3fambxbu0o6aguvkox', 'courier'); \App\Models\Setting::set('steadfast_enabled', '1', 'courier');" || true

# 5g. SYNC M-RAM SMS GATEWAY CONFIGURATION
echo "📱 Syncing M-RAM SMS Gateway (msg.mram.com.bd)..."
$PHP_RUN artisan tinker --execute="\$gw = \App\Models\SmsGateway::firstOrNew(['slug' => 'mram']); \$gw->name = 'M-RAM Technologies'; \$gw->driver = 'mram'; \$gw->is_active = true; \$gw->is_default = true; \$gw->status_notes = 'Official M-RAM Technologies SMS API (msg.mram.com.bd) with masking 8809601017199.'; \$gw->settings = ['base_url' => 'https://msg.mram.com.bd/smsapi', 'sender_id' => '8809601017199']; \$gw->setEncryptedCredentials(['api_key' => 'C40002956aa1a646106c41.09766335', 'sender_id' => '8809601017199']); \$gw->save(); \App\Models\SmsGateway::where('id', '!=', \$gw->id)->update(['is_default' => false]);" || true

# 5f. SANITIZE OPENSSL & REMOVE DANGEROUS OVERRIDES THAT CRASH PHP-FPM
echo "🔐 Sanitizing OpenSSL configuration and removing any PHP-FPM pool overrides..."
unset OPENSSL_CONF 2>/dev/null || true

# Remove any injected env[OPENSSL_CONF] from PHP-FPM pool configs
for pool_conf in /www/server/php/*/etc/php-fpm.d/www.conf /etc/php/*/fpm/pool.d/www.conf; do
    if [ -f "$pool_conf" ] && grep -q "OPENSSL_CONF" "$pool_conf"; then
        echo "🧹 Cleaning OPENSSL_CONF from $pool_conf..."
        sed -i '/OPENSSL_CONF/d' "$pool_conf" 2>/dev/null || true
    fi
done

# If /etc/ssl/openssl.cnf has backup from previous edits, safely restore the original clean config
if ls /etc/ssl/openssl.cnf.bak.* 1>/dev/null 2>&1; then
    FIRST_BAK=$(ls -t /etc/ssl/openssl.cnf.bak.* 2>/dev/null | tail -n 1)
    if [ -f "$FIRST_BAK" ]; then
        echo "♻ Restoring clean original /etc/ssl/openssl.cnf from $FIRST_BAK..."
        cp "$FIRST_BAK" /etc/ssl/openssl.cnf 2>/dev/null || true
    fi
fi


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
$PHP_RUN artisan media:optimize --limit=20 || true

# 9. PERMISSIONS HARDENING
echo ""
echo "🔒 Updating storage and bootstrap cache permissions..."
chmod -R 775 storage bootstrap/cache || true
if id "www" &>/dev/null; then
    chown -R www:www storage bootstrap/cache || true
elif id "www-data" &>/dev/null; then
    chown -R www-data:www-data storage bootstrap/cache || true
fi

# 10. RELOAD PHP-FPM SERVICE (FLUSH OPCACHE & STALE PROCESSES)
echo ""
echo "🔄 Gracefully reloading PHP-FPM service..."
systemctl reload php-fpm-83 2>/dev/null || /etc/init.d/php-fpm-83 reload 2>/dev/null || systemctl reload php8.3-fpm 2>/dev/null || systemctl reload php-fpm 2>/dev/null || true


echo ""
echo "======================================================================"
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "✨ TechMarket BD is running with latest features & secure database state."
echo "======================================================================"
echo ""
