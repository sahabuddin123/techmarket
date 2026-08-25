<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Setting;
use App\Services\MetaConversionsApiService;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeedController extends Controller
{
    /**
     * Resolve absolute product storefront URL safely.
     */
    public static function resolveProductUrl(Product $product): string
    {
        try {
            return route('product.show', ['slug' => $product->slug]);
        } catch (\Throwable $e) {
            return url('/product/' . urlencode((string)$product->slug));
        }
    }

    /**
     * Resolve absolute image URL safely without UrlGenerator leaks.
     */
    public static function resolveImageUrl(?string $image): string
    {
        if (empty($image) || !is_string($image) || trim($image) === '') {
            return url('/images/placeholder.png');
        }

        $image = trim($image);

        if (preg_match('/^https?:\/\//i', $image)) {
            return $image;
        }

        if (str_starts_with($image, '/')) {
            return url($image);
        }

        return url('/' . ltrim($image, '/'));
    }

    /**
     * Sanitize string for clean XML output (strip tags, invalid control chars).
     */
    private static function sanitizeXmlText(?string $text, int $maxLength = 4900): string
    {
        if (empty($text)) {
            return '';
        }

        $clean = strip_tags((string)$text);
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $clean);
        $clean = str_replace([']]>', '<![CDATA['], ['', ''], $clean);

        return mb_substr(trim($clean), 0, $maxLength);
    }

    /**
     * Generate Meta Catalog XML Product Feed (RSS 2.0 with g: namespace).
     */
    public function metaCatalogXml(): Response
    {
        $enabled = Setting::getBool('meta_feed_enabled', true);
        if (!$enabled) {
            return response('<error>Meta Product Feed is disabled in admin settings.</error>', 403)
                ->header('Content-Type', 'application/xml; charset=UTF-8');
        }

        $includeOutOfStock = Setting::getBool('feed_include_out_of_stock', true);
        $defaultBrand = Setting::get('feed_default_brand', 'TechMarket');
        $currency = Setting::get('feed_currency', 'BDT');

        $query = Product::with(['category', 'brand'])
            ->where('is_active', '!=', false);

        if (!$includeOutOfStock) {
            $query->where('stock', '>', 0);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . PHP_EOL;
        $xml .= '<channel>' . PHP_EOL;
        $xml .= '  <title><![CDATA[' . self::sanitizeXmlText(Setting::get('site_name', 'TechMarket BD')) . ' - Meta Product Catalog]]></title>' . PHP_EOL;
        $xml .= '  <link>' . url('/') . '</link>' . PHP_EOL;
        $xml .= '  <description><![CDATA[Automated dynamic product feed for Meta Commerce Manager & Dynamic Product Ads]]></description>' . PHP_EOL;

        // Process products safely via cursor iteration to handle large catalogs without memory exhaustion
        foreach ($query->cursor() as $p) {
            $contentId = MetaConversionsApiService::canonicalContentId($p->id);
            $productUrl = self::resolveProductUrl($p);
            $imageUrl = self::resolveImageUrl($p->image);
            $availability = $p->stock > 0 ? 'in stock' : 'out of stock';
            $brandName = $p->brand?->name ?: $defaultBrand;
            $categoryName = $p->category?->name ?: 'Hardware & Components';

            $regPrice = $p->regular_price && $p->regular_price > $p->price ? $p->regular_price : $p->price;
            $salePrice = $p->price;

            $desc = self::sanitizeXmlText($p->description ?: ($p->short_description ?: $p->title), 4900);
            $title = self::sanitizeXmlText($p->title, 150);

            $xml .= '  <item>' . PHP_EOL;
            $xml .= "    <g:id>{$contentId}</g:id>" . PHP_EOL;
            $xml .= "    <g:title><![CDATA[{$title}]]></g:title>" . PHP_EOL;
            $xml .= "    <g:description><![CDATA[{$desc}]]></g:description>" . PHP_EOL;
            $xml .= "    <g:link>{$productUrl}</g:link>" . PHP_EOL;
            $xml .= "    <g:image_link>{$imageUrl}</g:image_link>" . PHP_EOL;

            // Gallery images (up to 5)
            $gallery = is_array($p->gallery) ? $p->gallery : (is_string($p->gallery) ? json_decode($p->gallery, true) : []);
            if (is_array($gallery)) {
                $galCount = 0;
                foreach ($gallery as $galImg) {
                    if (is_string($galImg) && trim($galImg) !== '' && $galCount < 5) {
                        $gUrl = self::resolveImageUrl($galImg);
                        if ($gUrl !== $imageUrl) {
                            $xml .= "    <g:additional_image_link>{$gUrl}</g:additional_image_link>" . PHP_EOL;
                            $galCount++;
                        }
                    }
                }
            }

            $xml .= "    <g:condition>new</g:condition>" . PHP_EOL;
            $xml .= "    <g:availability>{$availability}</g:availability>" . PHP_EOL;
            $xml .= "    <g:price>" . number_format($regPrice, 2, '.', '') . " {$currency}</g:price>" . PHP_EOL;
            if ($salePrice < $regPrice) {
                $xml .= "    <g:sale_price>" . number_format($salePrice, 2, '.', '') . " {$currency}</g:sale_price>" . PHP_EOL;
            }
            $xml .= "    <g:brand><![CDATA[" . self::sanitizeXmlText($brandName, 100) . "]]></g:brand>" . PHP_EOL;
            $xml .= "    <g:product_type><![CDATA[" . self::sanitizeXmlText($categoryName, 100) . "]]></g:product_type>" . PHP_EOL;
            $xml .= "    <g:google_product_category><![CDATA[" . self::sanitizeXmlText($categoryName, 100) . "]]></g:google_product_category>" . PHP_EOL;

            if (!empty($p->sku)) {
                $xml .= "    <g:mpn><![CDATA[" . self::sanitizeXmlText($p->sku, 70) . "]]></g:mpn>" . PHP_EOL;
            }

            $xml .= '  </item>' . PHP_EOL;
        }

        $xml .= '</channel>' . PHP_EOL;
        $xml .= '</rss>';

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    /**
     * Generate Meta Catalog CSV Product Feed for Facebook Commerce Manager.
     */
    public function metaCatalogCsv(): Response
    {
        return $this->generateCsvResponse('meta-products.csv');
    }

    /**
     * Generate Universal CSV Product Feed.
     */
    public function productsCsv(): Response
    {
        return $this->generateCsvResponse('products.csv');
    }

    /**
     * Build CSV Product Feed safely using cursor iteration for large product catalogs.
     */
    private function generateCsvResponse(string $filename): Response
    {
        $enabled = Setting::getBool('meta_feed_enabled', true);
        if (!$enabled) {
            return response("error\nMeta Product Feed is disabled in admin settings.", 403)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        $includeOutOfStock = Setting::getBool('feed_include_out_of_stock', true);
        $defaultBrand = Setting::get('feed_default_brand', 'TechMarket');
        $currency = Setting::get('feed_currency', 'BDT');

        $query = Product::with(['category', 'brand'])
            ->where('is_active', '!=', false);

        if (!$includeOutOfStock) {
            $query->where('stock', '>', 0);
        }

        $headers = [
            'id',
            'title',
            'description',
            'availability',
            'condition',
            'price',
            'sale_price',
            'link',
            'image_link',
            'brand',
            'product_type',
            'google_product_category',
            'sku',
        ];

        $handle = fopen('php://temp', 'r+');

        // Write UTF-8 BOM for Excel / Sheets compatibility
        fwrite($handle, "\xEF\xBB\xBF");

        // Write header row
        fputcsv($handle, $headers);

        foreach ($query->cursor() as $p) {
            $contentId = MetaConversionsApiService::canonicalContentId($p->id);
            $productUrl = self::resolveProductUrl($p);
            $imageUrl = self::resolveImageUrl($p->image);
            $availability = $p->stock > 0 ? 'in stock' : 'out of stock';
            $brandName = $p->brand?->name ?: $defaultBrand;
            $categoryName = $p->category?->name ?: 'Hardware & Components';

            $regPrice = $p->regular_price && $p->regular_price > $p->price ? $p->regular_price : $p->price;
            $salePrice = $p->price;

            $rawDesc = $p->description ?: ($p->short_description ?: $p->title);
            $desc = mb_substr(trim(strip_tags((string)$rawDesc)), 0, 1000);

            fputcsv($handle, [
                $contentId,
                (string)$p->title,
                $desc,
                $availability,
                'new',
                number_format($regPrice, 2, '.', '') . " {$currency}",
                number_format($salePrice, 2, '.', '') . " {$currency}",
                $productUrl,
                $imageUrl,
                $brandName,
                $categoryName,
                $categoryName,
                (string)($p->sku ?: $contentId),
            ]);
        }

        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Generate Google Merchant Center XML Feed.
     */
    public function googleMerchantXml(): Response
    {
        return $this->metaCatalogXml();
    }
}
