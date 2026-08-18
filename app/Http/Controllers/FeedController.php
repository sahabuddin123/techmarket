<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Setting;
use App\Services\MetaConversionsApiService;
use Illuminate\Http\Response;

class FeedController extends Controller
{
    /**
     * Generate Meta Catalog XML Product Feed (RSS 2.0 with g: namespace).
     */
    public function metaCatalogXml(): Response
    {
        $enabled = Setting::getBool('meta_feed_enabled', true);
        if (!$enabled) {
            return response('<error>Meta Product Feed is disabled in admin settings.</error>', 403)
                ->header('Content-Type', 'application/xml');
        }

        $includeOutOfStock = Setting::getBool('feed_include_out_of_stock', true);
        $defaultBrand = Setting::get('feed_default_brand', 'TechMarket');

        $query = Product::with(['category', 'brand'])
            ->where('is_active', '!=', false);

        if (!$includeOutOfStock) {
            $query->where('stock', '>', 0);
        }

        $products = $query->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . PHP_EOL;
        $xml .= '<channel>' . PHP_EOL;
        $xml .= '<title><![CDATA[' . Setting::get('site_name', 'TechMarket BD') . ' - Meta Product Catalog]]></title>' . PHP_EOL;
        $xml .= '<link>' . url('/') . '</link>' . PHP_EOL;
        $xml .= '<description><![CDATA[Automated dynamic product feed for Meta Commerce Manager & Dynamic Product Ads]]></description>' . PHP_EOL;

        foreach ($products as $p) {
            $contentId = MetaConversionsApiService::canonicalContentId($p->id);
            $productUrl = url("/product/{$p->slug}");
            $imageUrl = str_starts_with($p->image, 'http') ? $p->image : url($p->image);
            $availability = $p->stock > 0 ? 'in stock' : 'out of stock';
            $brandName = $p->brand?->name ?: $defaultBrand;
            $categoryName = $p->category?->name ?: 'Hardware & Components';

            $regPrice = $p->regular_price && $p->regular_price > $p->price ? $p->regular_price : $p->price;
            $salePrice = $p->price;

            $desc = strip_tags($p->description ?: $p->title);
            $desc = substr($desc, 0, 4900);

            $xml .= '<item>' . PHP_EOL;
            $xml .= "  <g:id>{$contentId}</g:id>" . PHP_EOL;
            $xml .= "  <g:title><![CDATA[{$p->title}]]></g:title>" . PHP_EOL;
            $xml .= "  <g:description><![CDATA[{$desc}]]></g:description>" . PHP_EOL;
            $xml .= "  <g:link>{$productUrl}</g:link>" . PHP_EOL;
            $xml .= "  <g:image_link>{$imageUrl}</g:image_link>" . PHP_EOL;

            // Gallery images
            if (is_array($p->gallery)) {
                foreach (array_slice($p->gallery, 0, 5) as $galImg) {
                    $gUrl = str_starts_with($galImg, 'http') ? $galImg : url($galImg);
                    $xml .= "  <g:additional_image_link>{$gUrl}</g:additional_image_link>" . PHP_EOL;
                }
            }

            $xml .= "  <g:condition>new</g:condition>" . PHP_EOL;
            $xml .= "  <g:availability>{$availability}</g:availability>" . PHP_EOL;
            $xml .= "  <g:price>" . number_format($regPrice, 2, '.', '') . " BDT</g:price>" . PHP_EOL;
            if ($salePrice < $regPrice) {
                $xml .= "  <g:sale_price>" . number_format($salePrice, 2, '.', '') . " BDT</g:sale_price>" . PHP_EOL;
            }
            $xml .= "  <g:brand><![CDATA[{$brandName}]]></g:brand>" . PHP_EOL;
            $xml .= "  <g:product_type><![CDATA[{$categoryName}]]></g:product_type>" . PHP_EOL;
            $xml .= "  <g:google_product_category><![CDATA[{$categoryName}]]></g:google_product_category>" . PHP_EOL;
            $xml .= '</item>' . PHP_EOL;
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
        $enabled = Setting::getBool('meta_feed_enabled', true);
        if (!$enabled) {
            return response("error\nMeta Product Feed is disabled in admin settings.", 403)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        $includeOutOfStock = Setting::getBool('feed_include_out_of_stock', true);
        $defaultBrand = Setting::get('feed_default_brand', 'TechMarket');

        $query = Product::with(['category', 'brand'])->where('is_active', '!=', false);
        if (!$includeOutOfStock) {
            $query->where('stock', '>', 0);
        }
        $products = $query->get();

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
        ];

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);

        foreach ($products as $p) {
            $contentId = MetaConversionsApiService::canonicalContentId($p->id);
            $productUrl = url("/product/{$p->slug}");
            $imageUrl = !empty($p->image)
                ? (str_starts_with($p->image, 'http') ? $p->image : url($p->image))
                : url('/images/placeholder.png');
            $availability = $p->stock > 0 ? 'in stock' : 'out of stock';
            $brandName = $p->brand?->name ?: $defaultBrand;
            $categoryName = $p->category?->name ?: 'Hardware';

            $regPrice = $p->regular_price && $p->regular_price > $p->price ? $p->regular_price : $p->price;
            $salePrice = $p->price;
            $desc = substr(strip_tags($p->description ?: $p->title), 0, 1000);

            fputcsv($handle, [
                $contentId,
                $p->title,
                $desc,
                $availability,
                'new',
                number_format($regPrice, 2, '.', '') . ' BDT',
                number_format($salePrice, 2, '.', '') . ' BDT',
                $productUrl,
                $imageUrl,
                $brandName,
                $categoryName,
                $categoryName,
            ]);
        }

        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent, 200)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'inline; filename="meta-products.csv"');
    }

    /**
     * Generate Google Merchant Center XML Feed.
     */
    public function googleMerchantXml(): Response
    {
        return $this->metaCatalogXml();
    }
}
