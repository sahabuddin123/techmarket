<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('homepage_sections')) {
            Schema::create('homepage_sections', function (Blueprint $table) {
                $table->id();
                $table->string('section_key')->unique(); // hero_slider, featured_categories, featured_brands, flash_sale, trending_products, new_arrivals, best_sellers, pc_builder_promo
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_enabled')->default(true);
                $table->json('config')->nullable(); // limit, layout, items
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};
