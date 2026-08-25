<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductSlugRedirect;
use App\Models\Setting;
use Illuminate\Support\Str;

class ProductSeoService
{
    /**
     * Generate a collision-safe, clean SEO-friendly slug.
     */
    public static function generateUniqueSlug(string $title, ?int $ignoreProductId = null, ?string $preferredSlug = null): string
    {
        $baseSlug = Str::slug($preferredSlug ?: $title);
        if (empty($baseSlug)) {
            $baseSlug = 'product-' . Str::random(6);
        }

        $slug = $baseSlug;
        $counter = 2;

        while (Product::where('slug', $slug)
            ->when($ignoreProductId, fn ($q) => $q->where('id', '!=', $ignoreProductId))
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Register a 301 SEO redirect if the product slug has changed.
     */
    public static function handleSlugChange(Product $product, string $newSlug): void
    {
        if (!empty($product->slug) && $product->slug !== $newSlug) {
            ProductSlugRedirect::updateOrCreate(
                ['product_id' => $product->id, 'old_slug' => $product->slug],
                ['new_slug' => $newSlug]
            );
        }
    }

    /**
     * Auto-generate standard SEO metadata based on Product characteristics.
     */
    public static function autoGenerateSeoMetadata(string $title, ?string $brand = null, ?string $category = null, array $keySpecs = []): array
    {
        $siteName = Setting::get('site_name', 'TechMarket BD');
        $cleanTitle = trim($title);
        $brandText = $brand ? " - {$brand}" : '';

        // 1. Auto SEO Title
        $seoTitle = "{$cleanTitle} Price in Bangladesh | {$siteName}";
        if (strlen($seoTitle) > 65) {
            $seoTitle = "{$cleanTitle} | {$siteName}";
        }

        // 2. Focus Keyword extraction
        $focusKeyword = $cleanTitle;
        $words = explode(' ', $cleanTitle);
        if (count($words) > 4) {
            $focusKeyword = implode(' ', array_slice($words, 0, 4));
        }

        // 3. Auto Meta Description
        $specSnippet = '';
        if (!empty($keySpecs)) {
            $specsSample = array_slice($keySpecs, 0, 3);
            $specItems = [];
            foreach ($specsSample as $k => $v) {
                $specItems[] = is_string($k) ? "{$k}: {$v}" : $v;
            }
            $specSnippet = ' Features: ' . implode(', ', $specItems) . '.';
        }

        $metaDesc = "Buy {$cleanTitle}{$brandText} at the best price in Bangladesh from {$siteName}.{$specSnippet} Check authentic warranty, availability, full specifications & latest price in BD.";
        if (strlen($metaDesc) > 160) {
            $metaDesc = substr($metaDesc, 0, 157) . '...';
        }

        return [
            'seo_title' => $seoTitle,
            'meta_description' => $metaDesc,
            'focus_keyword' => $focusKeyword,
            'seo_slug' => Str::slug($cleanTitle),
        ];
    }

    /**
     * Calculate transparent non-blocking SEO Score & Checklist.
     */
    public static function calculateSeoScore(Product $product): array
    {
        $score = 0;
        $checks = [];
        $warnings = [];

        $title = $product->seo_title ?: $product->meta_title ?: $product->title;
        $description = $product->meta_description ?: strip_tags($product->description);
        $keyword = $product->focus_keyword;
        $slug = $product->slug;
        $hasImage = !empty($product->image);
        $isIndexable = $product->is_indexable && $product->meta_robots !== 'noindex';

        // 1. Title Check (20 pts)
        if (!empty($title)) {
            $len = strlen($title);
            if ($len >= 30 && $len <= 65) {
                $score += 20;
                $checks[] = 'SEO title is optimal length (30-65 characters).';
            } elseif ($len > 65) {
                $score += 12;
                $warnings[] = "SEO title is too long ({$len} chars). Google may truncate it.";
            } else {
                $score += 10;
                $warnings[] = "SEO title is short ({$len} chars). Aim for 30-65 characters.";
            }
        } else {
            $warnings[] = 'SEO title is missing.';
        }

        // 2. Meta Description Check (20 pts)
        if (!empty($description)) {
            $len = strlen($description);
            if ($len >= 70 && $len <= 160) {
                $score += 20;
                $checks[] = 'Meta description is optimal length (70-160 characters).';
            } elseif ($len > 160) {
                $score += 12;
                $warnings[] = "Meta description is too long ({$len} chars).";
            } else {
                $score += 10;
                $warnings[] = "Meta description is short ({$len} chars).";
            }
        } else {
            $warnings[] = 'Meta description is missing.';
        }

        // 3. Focus Keyword Presence (15 pts)
        if (!empty($keyword)) {
            $score += 15;
            $checks[] = "Focus keyword specified: \"{$keyword}\"";

            // Keyword in Title (15 pts)
            if (stripos($title, $keyword) !== false) {
                $score += 15;
                $checks[] = 'Focus keyword appears in SEO title.';
            } else {
                $warnings[] = 'Focus keyword does not appear in the SEO title.';
            }

            // Keyword in Description (10 pts)
            if (stripos($description, $keyword) !== false) {
                $score += 10;
                $checks[] = 'Focus keyword appears in Meta description.';
            } else {
                $warnings[] = 'Focus keyword does not appear in the Meta description.';
            }
        } else {
            $warnings[] = 'No focus keyword defined.';
        }

        // 4. Primary Image & Media (10 pts)
        if ($hasImage) {
            $score += 10;
            $checks[] = 'Primary showcase product image is attached.';
        } else {
            $warnings[] = 'Product is missing a showcase image.';
        }

        // 5. Indexable Status (10 pts)
        if ($isIndexable) {
            $score += 10;
            $checks[] = 'Search engine indexing is allowed (index, follow).';
        } else {
            $warnings[] = 'Product is configured as NOINDEX (hidden from search engines).';
        }

        $status = 'Poor';
        if ($score >= 80) {
            $status = 'Good';
        } elseif ($score >= 50) {
            $status = 'Needs Attention';
        }

        return [
            'score' => $score,
            'status' => $status,
            'checks' => $checks,
            'warnings' => $warnings,
        ];
    }

    /**
     * Resolve complete SEO payload for Product Detail rendering.
     */
    public static function resolveProductSeo(Product $product): array
    {
        $siteName = Setting::get('site_name', 'TechMarket BD');
        $canonicalUrl = $product->canonical_url ?: url("/product/{$product->slug}");

        // SEO Title Hierarchy
        $seoTitle = $product->seo_title
            ?: ($product->meta_title
                ?: "{$product->title} Price in Bangladesh | {$siteName}");

        // Meta Description Hierarchy
        $metaDescription = $product->meta_description;
        if (empty($metaDescription)) {
            $descText = strip_tags($product->description ?: '');
            if (!empty($descText)) {
                $metaDescription = substr($descText, 0, 155) . '...';
            } else {
                $metaDescription = "Buy {$product->title} at the best price in Bangladesh from {$siteName}. Authentic hardware with official warranty.";
            }
        }

        // Open Graph Hierarchy
        $ogTitle = $product->og_title ?: $seoTitle;
        $ogDescription = $product->og_description ?: $metaDescription;
        $ogImage = $product->og_image ?: ($product->image ?: Setting::get('default_og_image', url('/logo.png')));
        if (!str_starts_with($ogImage, 'http')) {
            $ogImage = url($ogImage);
        }

        // Twitter Hierarchy
        $twitterTitle = $product->twitter_title ?: $ogTitle;
        $twitterDescription = $product->twitter_description ?: $ogDescription;
        $twitterImage = $product->twitter_image ?: $ogImage;
        if (!str_starts_with($twitterImage, 'http')) {
            $twitterImage = url($twitterImage);
        }

        // Robots Hierarchy
        $metaRobots = (!$product->is_indexable || $product->meta_robots === 'noindex')
            ? 'noindex, nofollow'
            : ($product->meta_robots ?: 'index, follow');

        // Structured Data Schema (JSON-LD)
        $schema = static::generateProductJsonLd($product, $canonicalUrl, $ogImage, $metaDescription);

        return [
            'title' => $seoTitle,
            'description' => $metaDescription,
            'focus_keyword' => $product->focus_keyword,
            'canonical_url' => $canonicalUrl,
            'meta_robots' => $metaRobots,
            'og' => [
                'title' => $ogTitle,
                'description' => $ogDescription,
                'image' => $ogImage,
                'url' => $canonicalUrl,
                'type' => 'product',
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => $twitterTitle,
                'description' => $twitterDescription,
                'image' => $twitterImage,
            ],
            'json_ld' => $schema,
        ];
    }

    /**
     * Generate valid Schema.org Product JSON-LD structured data.
     */
    public static function generateProductJsonLd(Product $product, string $url, string $image, string $description): array
    {
        $availability = $product->stock > 0 
            ? 'https://schema.org/InStock' 
            : ($product->is_deal_of_day ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock');

        $price = (float) $product->price;

        $schema = [
            '@context' => 'https://schema.org/',
            '@type' => 'Product',
            'name' => $product->title,
            'image' => [$image],
            'description' => $description,
            'sku' => $product->sku ?: "TM-{$product->id}",
            'offers' => [
                '@type' => 'Offer',
                'url' => $url,
                'priceCurrency' => 'BDT',
                'price' => number_format($price, 2, '.', ''),
                'availability' => $availability,
                'itemCondition' => 'https://schema.org/NewCondition',
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

        // Support AggregateRating ONLY if real reviews exist
        if ($product->relationLoaded('reviews') && $product->reviews->count() > 0) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => round($product->reviews->avg('rating'), 1),
                'reviewCount' => $product->reviews->count(),
            ];
        }

        return $schema;
    }
}
