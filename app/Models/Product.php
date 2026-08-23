<?php

namespace App\Models;

use App\Services\ProductSeoService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'sku',
        'category_id',
        'brand_id',
        'price',
        'regular_price',
        'cost_price',
        'stock',
        'low_stock_threshold',
        'is_featured',
        'is_deal_of_day',
        'is_active',
        'component_type',
        'key_specs',
        'full_specs',
        'pc_builder_specs',
        'image',
        'gallery',
        'description',
        'short_description',
        'warranty',
        'meta_title',
        'seo_title',
        'meta_description',
        'focus_keyword',
        'canonical_url',
        'meta_robots',
        'og_title',
        'og_description',
        'og_image',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'is_indexable',
        'seo_score',
        'seo_last_updated_at',
    ];

    protected $casts = [
        'key_specs' => 'array',
        'full_specs' => 'array',
        'pc_builder_specs' => 'array',
        'gallery' => 'array',
        'is_featured' => 'boolean',
        'is_deal_of_day' => 'boolean',
        'is_active' => 'boolean',
        'is_indexable' => 'boolean',
        'price' => 'float',
        'regular_price' => 'float',
        'cost_price' => 'float',
        'low_stock_threshold' => 'integer',
        'seo_score' => 'integer',
        'seo_last_updated_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function specificationValues()
    {
        return $this->hasMany(ProductSpecificationValue::class);
    }

    public function slugRedirects()
    {
        return $this->hasMany(ProductSlugRedirect::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function questions()
    {
        return $this->hasMany(ProductQuestion::class);
    }

    public function cctvProfile()
    {
        return $this->hasOne(\App\Models\Cctv\CctvProductProfile::class);
    }

    public function cctvDeviceProfile()
    {
        return $this->hasOne(\App\Models\Cctv\CctvDeviceProfile::class);
    }

    public function cctvStorageProfile()
    {
        return $this->hasOne(\App\Models\Cctv\CctvStorageProfile::class);
    }

    public function cctvCableProfile()
    {
        return $this->hasOne(\App\Models\Cctv\CctvCableProfile::class);
    }

    /**
     * Get dynamic SEO score breakdown.
     */
    public function getSeoHealthAttribute(): array
    {
        return ProductSeoService::calculateSeoScore($this);
    }
}
