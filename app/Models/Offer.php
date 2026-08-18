<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'description',
        'banner_image',
        'mobile_banner_image',
        'thumbnail_image',
        'badge_text',
        'headline',
        'offer_validity_text',
        'cta_button_text',
        'cta_button_url',
        'terms_and_conditions',
        'perks',
        'features',
        'start_at',
        'end_at',
        'status',
        'is_active',
        'is_featured',
        'display_order',
        'show_countdown',
        'show_date_range',
        'show_product_count',
        'card_layout_style',
        'seo_title',
        'seo_description',
        'created_by',
    ];

    protected $casts = [
        'perks' => 'array',
        'features' => 'array',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'show_countdown' => 'boolean',
        'show_date_range' => 'boolean',
        'show_product_count' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'computed_status',
        'is_running',
        'is_scheduled',
        'is_expired',
    ];

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('storefront.offers.index');
        });

        static::deleted(function () {
            Cache::forget('storefront.offers.index');
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'offer_products')
            ->withPivot(['id', 'display_order', 'is_featured', 'badge'])
            ->withTimestamps()
            ->orderByPivot('display_order', 'asc');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Compute dynamic, time-aware status for the offer.
     */
    public function getComputedStatusAttribute(): string
    {
        if (!$this->is_active || $this->status === 'disabled') {
            return 'disabled';
        }

        if ($this->status === 'draft') {
            return 'draft';
        }

        $now = now();

        if ($this->start_at && $this->start_at->isFuture()) {
            return 'scheduled';
        }

        if ($this->end_at && $this->end_at->isPast()) {
            return 'expired';
        }

        return 'active';
    }

    public function getIsRunningAttribute(): bool
    {
        return $this->computed_status === 'active';
    }

    public function getIsScheduledAttribute(): bool
    {
        return $this->computed_status === 'scheduled';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->computed_status === 'expired';
    }
}
