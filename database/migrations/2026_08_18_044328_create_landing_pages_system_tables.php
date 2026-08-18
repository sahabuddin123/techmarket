<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Landing Pages Master Table
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('status', ['draft', 'published', 'paused', 'scheduled', 'expired', 'archived'])->default('draft');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            
            // Campaign Metadata
            $table->string('campaign_name')->nullable();
            $table->string('campaign_code')->nullable();
            $table->string('theme_color')->default('#f59e0b');
            
            // Layout & Controls
            $table->boolean('show_header')->default(true);
            $table->boolean('show_footer')->default(true);
            $table->boolean('show_sticky_order_btn')->default(true);
            $table->boolean('show_whatsapp_btn')->default(true);
            $table->boolean('show_call_btn')->default(true);
            $table->string('whatsapp_number')->nullable();
            $table->string('call_number')->nullable();
            $table->string('custom_order_button_text')->nullable()->default('অর্ডার করতে ক্লিক করুন / ORDER NOW');
            
            // Payment & Delivery Overrides
            $table->json('payment_methods')->nullable(); // ['cod', 'bkash', 'nagad']
            $table->decimal('inside_dhaka_charge', 8, 2)->nullable();
            $table->decimal('outside_dhaka_charge', 8, 2)->nullable();
            $table->boolean('is_free_delivery')->default(false);
            $table->decimal('custom_discount_amount', 10, 2)->nullable();
            
            // SEO & OpenGraph
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_image')->nullable();
            $table->string('canonical_url')->nullable();
            
            // Analytics & Pixel Overrides
            $table->string('meta_pixel_id')->nullable();
            $table->string('ga4_measurement_id')->nullable();
            $table->string('gtm_container_id')->nullable();
            $table->text('custom_css')->nullable();
            $table->text('custom_js')->nullable();
            
            // Schedule & Lifecycle
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Performance Counters
            $table->unsignedBigInteger('view_count')->default(0);
            $table->unsignedBigInteger('order_count')->default(0);
            $table->decimal('revenue_total', 14, 2)->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'published_at', 'expires_at']);
        });

        // 2. Landing Page Dynamic Sections
        Schema::create('landing_page_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landing_page_id')->constrained('landing_pages')->cascadeOnDelete();
            $table->string('section_type'); // hero, product_highlight, image_text, features, gallery, offer, comparison, why_us, reviews, faq, video, banner, rich_content, quick_order
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['landing_page_id', 'sort_order']);
        });

        // 3. Landing Page Real-Time Analytics & Funnel Events
        Schema::create('landing_page_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landing_page_id')->constrained('landing_pages')->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('event_name'); // page_view, view_content, initiate_checkout, add_payment_info, purchase, lead, whatsapp_click, call_click
            $table->string('event_id')->nullable(); // Deduplication key
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->decimal('value', 12, 2)->default(0);
            $table->string('currency', 10)->default('BDT');
            
            // Attribution
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('fbclid')->nullable();
            $table->string('gclid')->nullable();
            $table->string('campaign_id')->nullable();
            $table->string('adset_id')->nullable();
            $table->string('ad_id')->nullable();
            
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['landing_page_id', 'event_name', 'created_at']);
        });

        // 4. Update Orders Table with Attribution and Landing Page Reference
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('landing_page_id')->nullable()->after('user_id')->constrained('landing_pages')->nullOnDelete();
            $table->string('source_type')->default('ecommerce')->after('status'); // ecommerce, landing_page, quick_order
            $table->string('utm_source')->nullable()->after('source_type');
            $table->string('utm_medium')->nullable()->after('utm_source');
            $table->string('utm_campaign')->nullable()->after('utm_medium');
            $table->string('utm_content')->nullable()->after('utm_campaign');
            $table->string('utm_term')->nullable()->after('utm_content');
            $table->string('fbclid')->nullable()->after('utm_term');
            $table->string('gclid')->nullable()->after('fbclid');
            $table->string('campaign_id')->nullable()->after('gclid');
            $table->string('adset_id')->nullable()->after('campaign_id');
            $table->string('ad_id')->nullable()->after('adset_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['landing_page_id']);
            $table->dropColumn([
                'landing_page_id',
                'source_type',
                'utm_source',
                'utm_medium',
                'utm_campaign',
                'utm_content',
                'utm_term',
                'fbclid',
                'gclid',
                'campaign_id',
                'adset_id',
                'ad_id'
            ]);
        });

        Schema::dropIfExists('landing_page_events');
        Schema::dropIfExists('landing_page_sections');
        Schema::dropIfExists('landing_pages');
    }
};
