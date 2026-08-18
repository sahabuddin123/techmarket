<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class LandingPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'product_id',
        'campaign_name',
        'campaign_code',
        'theme_color',
        'show_header',
        'show_footer',
        'show_sticky_order_btn',
        'show_whatsapp_btn',
        'show_call_btn',
        'whatsapp_number',
        'call_number',
        'custom_order_button_text',
        'payment_methods',
        'inside_dhaka_charge',
        'outside_dhaka_charge',
        'is_free_delivery',
        'custom_discount_amount',
        'meta_title',
        'meta_description',
        'meta_image',
        'canonical_url',
        'meta_pixel_id',
        'ga4_measurement_id',
        'gtm_container_id',
        'custom_css',
        'custom_js',
        'published_at',
        'expires_at',
        'created_by',
        'view_count',
        'order_count',
        'revenue_total',
    ];

    protected $casts = [
        'payment_methods' => 'array',
        'show_header' => 'boolean',
        'show_footer' => 'boolean',
        'show_sticky_order_btn' => 'boolean',
        'show_whatsapp_btn' => 'boolean',
        'show_call_btn' => 'boolean',
        'is_free_delivery' => 'boolean',
        'inside_dhaka_charge' => 'float',
        'outside_dhaka_charge' => 'float',
        'custom_discount_amount' => 'float',
        'view_count' => 'integer',
        'order_count' => 'integer',
        'revenue_total' => 'float',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = [
        'conversion_rate',
        'public_url',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(LandingPageSection::class)->orderBy('sort_order', 'asc');
    }

    public function events(): HasMany
    {
        return $this->hasMany(LandingPageEvent::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getConversionRateAttribute(): float
    {
        if ($this->view_count <= 0) {
            return 0.0;
        }
        return round(($this->order_count / $this->view_count) * 100, 2);
    }

    public function getPublicUrlAttribute(): string
    {
        return url('/l/' . $this->slug);
    }

    public function isPubliclyAccessible(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        $now = Carbon::now();
        if ($this->published_at && $this->published_at->isFuture()) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Generate standard default dynamic sections for a newly initialized landing page.
     */
    public function generateDefaultSections(): void
    {
        $product = $this->product;
        $title = $product ? $product->title : $this->name;
        $specs = $product && is_array($product->key_specs) ? $product->key_specs : [
            '100% Genuine Official Product',
            'Official Brand Warranty in Bangladesh',
            'Super Fast Home Delivery All Over Bangladesh',
            '7 Days Easy Replacement Guarantee'
        ];

        $defaultSections = [
            [
                'section_type' => 'hero',
                'title' => "Special Offer on {$title}",
                'subtitle' => 'Get the best deal today with official warranty & super fast home delivery.',
                'sort_order' => 1,
                'is_visible' => true,
                'settings' => [
                    'badge' => '🔥 LIMITED TIME OFFER',
                    'offer_pill' => 'Mega Savings Deal',
                    'countdown_enabled' => true,
                    'countdown_hours' => 48,
                    'cta_text' => 'অর্ডার করতে ক্লিক করুন / ORDER NOW',
                    'cta_subtext' => 'Cash on Delivery Available Nationwide',
                    'background_type' => 'gradient',
                    'hero_image' => $product?->image,
                ]
            ],
            [
                'section_type' => 'product_highlight',
                'title' => 'Product Highlights & Specifications',
                'subtitle' => 'Designed for superior performance and everyday reliability',
                'sort_order' => 2,
                'is_visible' => true,
                'settings' => [
                    'highlight_points' => $specs,
                    'show_stock_badge' => true,
                    'show_warranty_badge' => true,
                    'show_sku' => true,
                ]
            ],
            [
                'section_type' => 'features',
                'title' => 'Why This Is The Best Choice For You',
                'subtitle' => 'Premium build, certified quality, and backed by official warranty.',
                'sort_order' => 3,
                'is_visible' => true,
                'settings' => [
                    'items' => [
                        ['title' => 'Authentic Quality', 'desc' => '100% genuine sealed pack directly from authorized distributors.', 'icon' => 'ShieldCheck'],
                        ['title' => 'Official Warranty', 'desc' => 'Hassle-free brand warranty support across all service centers in BD.', 'icon' => 'Award'],
                        ['title' => 'Lightning Fast Delivery', 'desc' => '24-48 hours delivery inside Dhaka, 2-3 days nationwide via top couriers.', 'icon' => 'Truck'],
                        ['title' => 'Inspection on Delivery', 'desc' => 'Check your package before accepting and pay cash upon receipt.', 'icon' => 'CheckCircle2'],
                    ]
                ]
            ],
            [
                'section_type' => 'gallery',
                'title' => 'Product Visual Showcase',
                'subtitle' => 'High-resolution photographs from all angles',
                'sort_order' => 4,
                'is_visible' => true,
                'settings' => [
                    'images' => !empty($product?->gallery) && is_array($product->gallery) ? $product->gallery : ($product?->image ? [$product->image] : []),
                    'video_url' => '',
                ]
            ],
            [
                'section_type' => 'offer',
                'title' => 'Exclusive Campaign Pricing',
                'subtitle' => 'Order today to lock in special price before stock runs out!',
                'sort_order' => 5,
                'is_visible' => true,
                'settings' => [
                    'show_gift' => true,
                    'gift_text' => 'Free Protection Accessories Included with Every Order',
                    'urgency_text' => 'Only limited stock left at this promotional rate.',
                    'cta_text' => 'অর্ডার করতে ক্লিক করুন / ORDER NOW',
                ]
            ],
            [
                'section_type' => 'why_us',
                'title' => 'Why Choose TechMarket BD?',
                'subtitle' => 'Trusted by 100,000+ satisfied tech enthusiasts across Bangladesh',
                'sort_order' => 6,
                'is_visible' => true,
                'settings' => [
                    'points' => [
                        ['title' => 'Cash On Delivery', 'desc' => 'No advance payment needed for standard orders. Pay cash at your doorstep.'],
                        ['title' => '24/7 Dedicated Support', 'desc' => 'Direct phone & WhatsApp support for instant setup help & queries.'],
                        ['title' => '7-Days Replacement', 'desc' => 'Instant replacement if any manufacturing fault is discovered.'],
                        ['title' => 'Official Invoice & Tax', 'desc' => 'Computerized printed tax invoice with full warranty validation.'],
                    ]
                ]
            ],
            [
                'section_type' => 'quick_order',
                'title' => 'অর্ডার সম্পন্ন করতে নিচের ফর্মটি পূরণ করুন',
                'subtitle' => 'Please fill in your delivery details to confirm your order immediately.',
                'sort_order' => 7,
                'is_visible' => true,
                'settings' => [
                    'heading_bn' => 'অর্ডার করতে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা দিন',
                    'order_btn_text' => 'অর্ডার কনফার্ম করুন (Confirm Order)',
                    'guarantee_badge' => '🔒 100% Secure & Fast Ordering',
                ]
            ],
            [
                'section_type' => 'reviews',
                'title' => 'Customer Feedback & Ratings',
                'subtitle' => 'What verified buyers in Bangladesh say about this product',
                'sort_order' => 8,
                'is_visible' => true,
                'settings' => [
                    'show_verified_badge' => true,
                    'max_items' => 6,
                ]
            ],
            [
                'section_type' => 'faq',
                'title' => 'Frequently Asked Questions',
                'subtitle' => 'Everything you need to know before ordering',
                'sort_order' => 9,
                'is_visible' => true,
                'settings' => [
                    'faqs' => [
                        ['q' => 'পণ্যটি কি ১০০% অরিজিনাল?', 'a' => 'হ্যাঁ, TechMarket BD-এর প্রতিটি পণ্য ১০০% অরিজিনাল ও ইনটেক সিল প্যাক করা।'],
                        ['q' => 'আমি কীভাবে পণ্যটি রিসিভ করব এবং পেমেন্ট করব?', 'a' => 'সারাদেশে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি দেওয়া হয়। ডেলিভারি ম্যানের কাছ থেকে পণ্য দেখে পেমেন্ট করতে পারবেন।'],
                        ['q' => 'ডেলিভারি হতে কত সময় লাগবে?', 'a' => 'ঢাকার ভিতরে ২৪ থেকে ৪৮ ঘণ্টা এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।'],
                        ['q' => 'কোনো সমস্যা থাকলে কি পরিবর্তন করা যাবে?', 'a' => 'হ্যাঁ, পণ্যটিতে কোনো ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে সরাসরি রিপ্লেসমেন্ট সুবিধা রয়েছে।'],
                    ]
                ]
            ],
        ];

        foreach ($defaultSections as $sec) {
            $this->sections()->create($sec);
        }
    }
}
