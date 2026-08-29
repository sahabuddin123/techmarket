<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SeoService
{
    /**
     * Cache duration for sitemap (24 hours).
     */
    public const SITEMAP_CACHE_TTL = 86400;

    /**
     * Generate dynamic XML sitemap with Google Image support.
     */
    public static function generateSitemapXml(): string
    {
        return Cache::remember('site_sitemap_xml', self::SITEMAP_CACHE_TTL, function () {
            $baseUrl = rtrim(config('app.url', url('/')), '/');

            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
            $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

            // 1. Homepage
            $xml .= self::formatUrlTag($baseUrl . '/', 'daily', '1.0', now()->toAtomString());

            // 2. Core Feature & Tool Pages
            $corePages = [
                '/catalog' => ['freq' => 'hourly', 'priority' => '0.9'],
                '/pc-builder' => ['freq' => 'weekly', 'priority' => '0.8'],
                '/cctv-estimator' => ['freq' => 'weekly', 'priority' => '0.8'],
                '/offers' => ['freq' => 'daily', 'priority' => '0.85'],
                '/servicing' => ['freq' => 'monthly', 'priority' => '0.7'],
                '/compare' => ['freq' => 'monthly', 'priority' => '0.5'],
                '/page/about-us' => ['freq' => 'monthly', 'priority' => '0.6'],
                '/page/contact-us' => ['freq' => 'monthly', 'priority' => '0.6'],
                '/page/terms' => ['freq' => 'monthly', 'priority' => '0.4'],
                '/page/privacy' => ['freq' => 'monthly', 'priority' => '0.4'],
                '/page/return-policy' => ['freq' => 'monthly', 'priority' => '0.4'],
            ];

            foreach ($corePages as $path => $meta) {
                $xml .= self::formatUrlTag($baseUrl . $path, $meta['freq'], $meta['priority'], now()->toAtomString());
            }

            // 3. Active Categories
            $categories = Category::select(['id', 'slug', 'name', 'updated_at'])->get();
            foreach ($categories as $cat) {
                if (empty($cat->slug)) continue;
                $url = $baseUrl . '/catalog?category=' . urlencode($cat->slug);
                $lastMod = $cat->updated_at ? $cat->updated_at->toAtomString() : now()->toAtomString();
                $xml .= self::formatUrlTag($url, 'daily', '0.85', $lastMod);
            }

            // 4. Active Brands
            $brands = Brand::where(function ($q) {
                $q->where('is_active', true)->orWhereNull('is_active');
            })->select(['id', 'slug', 'name', 'updated_at'])->get();

            foreach ($brands as $brand) {
                if (empty($brand->slug)) continue;
                $url = $baseUrl . '/catalog?brand=' . urlencode($brand->slug);
                $lastMod = $brand->updated_at ? $brand->updated_at->toAtomString() : now()->toAtomString();
                $xml .= self::formatUrlTag($url, 'weekly', '0.75', $lastMod);
            }

            // 5. Active Products (With Image Sitemap extensions)
            $products = Product::where(function ($q) {
                $q->where('is_active', true)->orWhereNull('is_active');
            })
            ->select(['id', 'slug', 'title', 'image', 'gallery', 'updated_at'])
            ->latest('updated_at')
            ->take(5000)
            ->get();

            foreach ($products as $prod) {
                if (empty($prod->slug)) continue;
                $prodUrl = $baseUrl . '/product/' . urlencode($prod->slug);
                $lastMod = $prod->updated_at ? $prod->updated_at->toAtomString() : now()->toAtomString();

                $images = [];
                if (!empty($prod->image)) {
                    $imgUrl = str_starts_with($prod->image, 'http') ? $prod->image : $baseUrl . '/' . ltrim($prod->image, '/');
                    $images[] = [
                        'loc' => $imgUrl,
                        'title' => $prod->title,
                    ];
                }

                $xml .= self::formatUrlTag($prodUrl, 'daily', '0.9', $lastMod, $images);
            }

            // 6. Custom CMS Pages
            if (class_exists(CmsPage::class)) {
                $pages = CmsPage::where('is_published', true)->select(['id', 'slug', 'title', 'updated_at'])->get();
                foreach ($pages as $page) {
                    if (empty($page->slug)) continue;
                    $url = $baseUrl . '/page/' . urlencode($page->slug);
                    $lastMod = $page->updated_at ? $page->updated_at->toAtomString() : now()->toAtomString();
                    $xml .= self::formatUrlTag($url, 'monthly', '0.6', $lastMod);
                }
            }

            $xml .= '</urlset>';

            return $xml;
        });
    }

    /**
     * Format a single <url> entry with optional image nodes.
     */
    protected static function formatUrlTag(
        string $loc,
        string $changeFreq,
        string $priority,
        string $lastMod,
        array $images = []
    ): string {
        $xml = "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
        $xml .= "    <lastmod>{$lastMod}</lastmod>\n";
        $xml .= "    <changefreq>{$changeFreq}</changefreq>\n";
        $xml .= "    <priority>{$priority}</priority>\n";

        foreach ($images as $img) {
            $xml .= "    <image:image>\n";
            $xml .= "      <image:loc>" . htmlspecialchars($img['loc'], ENT_XML1, 'UTF-8') . "</image:loc>\n";
            if (!empty($img['title'])) {
                $xml .= "      <image:title>" . htmlspecialchars($img['title'], ENT_XML1, 'UTF-8') . "</image:title>\n";
            }
            $xml .= "    </image:image>\n";
        }

        $xml .= "  </url>\n";
        return $xml;
    }

    /**
     * Generate dynamic robots.txt directives.
     */
    public static function generateRobotsTxt(): string
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');

        $lines = [
            'User-agent: *',
            'Allow: /',
            'Allow: /catalog',
            'Allow: /product/',
            'Allow: /page/',
            'Allow: /storage/',
            'Allow: /build/',
            '',
            '# Disallow internal admin & transactional endpoints',
            'Disallow: /admin',
            'Disallow: /admin/',
            'Disallow: /checkout',
            'Disallow: /cart',
            'Disallow: /api/',
            'Disallow: /password/',
            'Disallow: /login',
            'Disallow: /register',
            '',
            "# Canonical Sitemap",
            "Sitemap: {$baseUrl}/sitemap.xml",
        ];

        return implode("\n", $lines) . "\n";
    }

    /**
     * Generate Organization Schema (JSON-LD).
     */
    public static function getOrganizationSchema(): array
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        $siteName = Setting::get('site_name', config('app.name', 'TechMarket BD'));
        $siteLogo = Setting::get('site_logo', $baseUrl . '/storage/logo.png');
        $phone = Setting::get('contact_phone', '+8801700000000');
        $email = Setting::get('contact_email', 'support@techmarket.com.bd');
        $address = Setting::get('contact_address', 'Dhaka, Bangladesh');

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $siteName,
            'url' => $baseUrl,
            'logo' => $siteLogo,
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => $phone,
                'contactType' => 'customer service',
                'email' => $email,
                'areaServed' => 'BD',
                'availableLanguage' => ['English', 'Bengali'],
            ],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $address,
                'addressLocality' => Setting::get('contact_city', 'Dhaka'),
                'addressRegion' => 'Dhaka Division',
                'postalCode' => Setting::get('contact_postal_code', '1200'),
                'addressCountry' => 'BD',
            ],
        ];
    }

    /**
     * Generate WebSite Schema with Google Sitelinks Searchbox (JSON-LD).
     */
    public static function getWebSiteSchema(): array
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        $siteName = Setting::get('site_name', config('app.name', 'TechMarket BD'));

        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $siteName,
            'url' => $baseUrl,
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => "{$baseUrl}/catalog?search={search_term_string}",
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /**
     * Generate Product Schema (JSON-LD) for Single Product Page.
     */
    public static function getProductSchema(Product $product): array
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        $prodUrl = $baseUrl . '/product/' . $product->slug;
        $price = (float) ($product->sale_price ?? $product->price ?? 0);
        $stock = ($product->stock_quantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

        $images = [];
        if ($product->featured_image) {
            $images[] = str_starts_with($product->featured_image, 'http')
                ? $product->featured_image
                : $baseUrl . '/' . ltrim($product->featured_image, '/');
        }

        if (is_array($product->images)) {
            foreach ($product->images as $img) {
                if (is_string($img) && !empty($img)) {
                    $images[] = str_starts_with($img, 'http') ? $img : $baseUrl . '/' . ltrim($img, '/');
                }
            }
        }

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->title,
            'description' => strip_tags((string) ($product->short_description ?: $product->description ?: $product->title)),
            'image' => array_values(array_unique($images)),
            'sku' => (string) ($product->sku ?: "TMB-{$product->id}"),
            'mpn' => (string) ($product->sku ?: "TMB-{$product->id}"),
            'offers' => [
                '@type' => 'Offer',
                'url' => $prodUrl,
                'priceCurrency' => 'BDT',
                'price' => number_format($price, 2, '.', ''),
                'availability' => $stock,
                'itemCondition' => 'https://schema.org/NewCondition',
                'seller' => [
                    '@type' => 'Organization',
                    'name' => Setting::get('site_name', 'TechMarket BD'),
                ],
            ],
        ];

        if ($product->brand) {
            $schema['brand'] = [
                '@type' => 'Brand',
                'name' => $product->brand->name,
            ];
        }

        if ($product->category) {
            $schema['category'] = $product->category->name;
        }

        if (($product->rating ?? 0) > 0) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => number_format((float) $product->rating, 1, '.', ''),
                'reviewCount' => max(1, (int) ($product->reviews_count ?? 1)),
            ];
        }

        return $schema;
    }

    /**
     * Clear dynamic sitemap and SEO caches.
     */
    public static function clearSeoCache(): void
    {
        Cache::forget('site_sitemap_xml');
    }
}
