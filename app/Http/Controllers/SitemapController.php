<?php

namespace App\Http\Controllers;

use App\Services\SeoService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Render the dynamic XML sitemap with Google Image support.
     */
    public function sitemap(): Response
    {
        $xml = SeoService::generateSitemapXml();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'X-Robots-Tag' => 'noindex, follow',
            'Cache-Control' => 'public, max-age=86400',
        ]);
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
}
