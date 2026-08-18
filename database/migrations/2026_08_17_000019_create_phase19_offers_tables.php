<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            
            // Media & Visual Assets
            $table->string('banner_image')->nullable();
            $table->string('mobile_banner_image')->nullable();
            $table->string('thumbnail_image')->nullable();
            
            // Headline & Storefront Display Copy
            $table->string('badge_text')->nullable();
            $table->string('headline')->nullable();
            $table->string('offer_validity_text')->nullable();
            $table->string('cta_button_text')->default('BUY NOW →');
            $table->string('cta_button_url')->nullable();
            $table->text('terms_and_conditions')->nullable();
            
            // Structured Perks & Feature Cards (JSON)
            $table->json('perks')->nullable();
            $table->json('features')->nullable();
            
            // Schedule & Status
            $table->dateTime('start_at')->nullable()->index();
            $table->dateTime('end_at')->nullable()->index();
            $table->string('status')->default('active')->index(); // draft, scheduled, active, expired, disabled
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->integer('display_order')->default(0)->index();
            
            // Storefront Visual Toggles
            $table->boolean('show_countdown')->default(true);
            $table->boolean('show_date_range')->default(true);
            $table->boolean('show_product_count')->default(true);
            $table->string('card_layout_style')->default('standard');
            
            // SEO Meta
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('offer_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('display_order')->default(0)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->string('badge')->nullable(); // e.g. "FREE MOVIE TICKET", "HOT DEAL"
            $table->timestamps();

            $table->unique(['offer_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offer_products');
        Schema::dropIfExists('offers');
    }
};
