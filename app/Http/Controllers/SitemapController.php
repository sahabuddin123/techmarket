<?php

namespace App\Http\Controllers;

use App\Services\SeoService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Alias for sitemap() to satisfy index() calls.
     */
    public function index(): Response
    {
        return $this->sitemap();
    }

    /**
     * Invokable route support.
     */
    public function __invoke(): Response
    {
        return $this->sitemap();
    }

    /**
     * Render the dynamic XML sitemap with Google Image support.
     */
    public function sitemap(): Response
    {
        try {
            $xml = SeoService::generateSitemapXml();

            return response($xml, 200, [
                'Content-Type' => 'application/xml; charset=utf-8',
                'X-Robots-Tag' => 'noindex, follow',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Sitemap Error: ' . $e->getMessage());

            $baseUrl = rtrim(config('app.url', url('/')), '/');
            $fallback = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $fallback .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            $fallback .= '  <url><loc>' . htmlspecialchars($baseUrl . '/', ENT_XML1, 'UTF-8') . '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>' . "\n";
            $fallback .= '  <url><loc>' . htmlspecialchars($baseUrl . '/catalog', ENT_XML1, 'UTF-8') . '</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>' . "\n";
            $fallback .= '</urlset>';

            return response($fallback, 200, [
                'Content-Type' => 'application/xml; charset=utf-8',
                'X-Robots-Tag' => 'noindex, follow',
            ]);
        }
    }

    /**
     * Render dynamic robots.txt directives.
     */
    public function robots(): Response
    {
        $content = SeoService::generateRobotsTxt();

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Handle IndexNow API key verification file ({key}.txt).
     */
    public function indexNowKey(string $key): Response
    {
        $configuredKey = \App\Models\Setting::get('indexnow_key');
        
        // If matches configured key or if valid format, return key content
        if ($configuredKey && $configuredKey === $key) {
            return response($configuredKey, 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
            ]);
        }

        if (strlen($key) >= 16 && strlen($key) <= 64 && ctype_alnum(str_replace(['-', '_'], '', $key))) {
            return response($key, 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
            ]);
        }

        abort(404);
    }
}
