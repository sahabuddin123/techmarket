<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic domain-aware XML sitemap.
     */
    public function index(): Response
    {
        $products = Product::where('is_active', '!=', false)
            ->where('is_indexable', true)
            ->where(function ($q) {
                $q->whereNull('meta_robots')
                  ->orWhere('meta_robots', 'not like', '%noindex%');
            })
            ->select('id', 'slug', 'updated_at')
            ->get();

        $categories = Category::where('is_nav_visible', true)
            ->select('id', 'slug', 'updated_at')
            ->get();

        $brands = Brand::select('id', 'slug', 'updated_at')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        // 1. Static & Core CMS Pages
        $staticPages = [
            ['url' => url('/'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => url('/shop'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => url('/pc-builder'), 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['url' => url('/compare'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['url' => url('/pages/about-us'), 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => url('/blog'), 'priority' => '0.8', 'changefreq' => 'daily'],
        ];

        foreach ($staticPages as $page) {
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . htmlspecialchars($page['url']) . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>' . $page['changefreq'] . '</changefreq>' . PHP_EOL;
            $xml .= '  <priority>' . $page['priority'] . '</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
        }

        // 2. Categories
        foreach ($categories as $cat) {
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . htmlspecialchars(url("/category/{$cat->slug}")) . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . $cat->updated_at->format('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
        }

        // 3. Products
        foreach ($products as $prod) {
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . htmlspecialchars(url("/product/{$prod->slug}")) . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . $prod->updated_at->format('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>daily</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.8</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
        }

        // 4. Brands
        foreach ($brands as $brand) {
            $xml .= '<url>' . PHP_EOL;
            $xml .= '  <loc>' . htmlspecialchars(url("/shop?brand={$brand->slug}")) . '</loc>' . PHP_EOL;
            $xml .= '  <lastmod>' . $brand->updated_at->format('Y-m-d') . '</lastmod>' . PHP_EOL;
            $xml .= '  <changefreq>weekly</changefreq>' . PHP_EOL;
            $xml .= '  <priority>0.6</priority>' . PHP_EOL;
            $xml .= '</url>' . PHP_EOL;
        }

        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'text/xml; charset=utf-8');
    }
}
