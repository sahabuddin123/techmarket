<?php

// Universal polyfills for servers with incomplete mbstring regex extensions
if (!function_exists('mb_split')) {
    function mb_split(string $pattern, string $string, int $limit = -1): array|false {
        $result = @preg_split('/' . $pattern . '/u', $string, $limit);
        if ($result === false) {
            $result = @preg_split('/' . $pattern . '/', $string, $limit);
        }
        return $result;
    }
}

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            'api/chatbot/*',
            'api/tracking/event',
            'payment/sslcommerz/*',
        ]);

        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'admin' => \App\Http\Middleware\EnsureAdminUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
