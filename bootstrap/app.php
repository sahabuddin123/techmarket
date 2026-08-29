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

// Universal polyfills for servers with missing or corrupted ext-fileinfo
if (!defined('FILEINFO_NONE')) define('FILEINFO_NONE', 0);
if (!defined('FILEINFO_SYMLINK')) define('FILEINFO_SYMLINK', 2);
if (!defined('FILEINFO_MIME')) define('FILEINFO_MIME', 1040);
if (!defined('FILEINFO_MIME_TYPE')) define('FILEINFO_MIME_TYPE', 16);
if (!defined('FILEINFO_MIME_ENCODING')) define('FILEINFO_MIME_ENCODING', 1024);
if (!defined('FILEINFO_RAW')) define('FILEINFO_RAW', 256);

if (!class_exists('finfo', false)) {
    class finfo {
        protected int $flags;
        protected ?string $magicFile;

        public function __construct(int $flags = FILEINFO_NONE, ?string $magicFile = null) {
            $this->flags = $flags;
            $this->magicFile = $magicFile;
        }

        public function set_flags(int $flags): bool {
            $this->flags = $flags;
            return true;
        }

        public function file(string $filename, int $flags = FILEINFO_NONE, $context = null): string|false {
            if (!file_exists($filename)) {
                return false;
            }
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $map = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'ico' => 'image/x-icon',
                'bmp' => 'image/bmp',
                'avif' => 'image/avif',
                'pdf' => 'application/pdf',
                'json' => 'application/json',
                'zip' => 'application/zip',
                'sql' => 'application/sql',
                'sqlite' => 'application/x-sqlite3',
                'csv' => 'text/csv',
                'txt' => 'text/plain',
                'html' => 'text/html',
                'css' => 'text/css',
                'js' => 'text/javascript',
            ];
            if (isset($map[$ext])) {
                return $map[$ext];
            }
            $img = @getimagesize($filename);
            if ($img && !empty($img['mime'])) {
                return $img['mime'];
            }
            return 'application/octet-stream';
        }

        public function buffer(string $string, int $flags = FILEINFO_NONE, $context = null): string|false {
            return 'application/octet-stream';
        }
    }
}

if (!function_exists('finfo_open')) {
    function finfo_open(int $flags = FILEINFO_NONE, ?string $magic_database = null) {
        return new finfo($flags, $magic_database);
    }
}
if (!function_exists('finfo_file')) {
    function finfo_file($finfo, string $filename, int $flags = FILEINFO_NONE, $context = null) {
        if ($finfo instanceof finfo) {
            return $finfo->file($filename, $flags, $context);
        }
        return false;
    }
}
if (!function_exists('finfo_buffer')) {
    function finfo_buffer($finfo, string $string, int $flags = FILEINFO_NONE, $context = null) {
        if ($finfo instanceof finfo) {
            return $finfo->buffer($string, $flags, $context);
        }
        return false;
    }
}
if (!function_exists('finfo_close')) {
    function finfo_close($finfo): bool {
        return true;
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
            'api/*',
            'api/chatbot/*',
            'api/tracking/*',
            'api/tracking/event',
            'payment/sslcommerz/*',
            'cart/*',
            'wishlist/*',
            'compare/*',
            'tracking/*',
        ]);

        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'admin' => \App\Http\Middleware\EnsureAdminUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            $isNotFound = $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
                || $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException
                || (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 404);

            if ($isNotFound && !$request->expectsJson() && !str_starts_with($request->path(), 'api/')) {
                // Smart 404 Recovery: Recommended & Featured Products
                $recommendedProducts = \App\Models\Product::where(function ($q) {
                    $q->where('is_active', true)->orWhereNull('is_active');
                })
                ->where('is_featured', true)
                ->latest()
                ->take(8)
                ->get();

                if ($recommendedProducts->count() < 4) {
                    $recommendedProducts = \App\Models\Product::where(function ($q) {
                        $q->where('is_active', true)->orWhereNull('is_active');
                    })
                    ->latest()
                    ->take(8)
                    ->get();
                }

                $topCategories = \App\Models\Category::whereNull('parent_id')
                    ->where('is_nav_visible', true)
                    ->orderBy('sort_order')
                    ->take(8)
                    ->get();

                return \Inertia\Inertia::render('Errors/NotFound', [
                    'status' => 404,
                    'requestedPath' => $request->path(),
                    'recommendedProducts' => $recommendedProducts,
                    'topCategories' => $topCategories,
                    'seo' => [
                        'title' => '404 - Page Not Found | TechMarket BD',
                        'description' => 'Sorry, the page or hardware you are looking for could not be found. Explore TechMarket BD for latest laptops, gaming computers and accessories.',
                        'meta_robots' => 'noindex, nofollow',
                    ],
                ])->toResponse($request)->setStatusCode(404);
            }

            if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                return back()->with('message', 'Page expired, please try again.');
            }
        });
    })->create();
