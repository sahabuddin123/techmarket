<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Configure OpenSSL legacy renegotiation support for external API gateways
if (file_exists($sslCnf = __DIR__.'/../config/openssl_legacy.cnf')) {
    if (function_exists('putenv')) {
        @putenv("OPENSSL_CONF={$sslCnf}");
    }
    $_ENV['OPENSSL_CONF'] = $sslCnf;
    $_SERVER['OPENSSL_CONF'] = $sslCnf;
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
