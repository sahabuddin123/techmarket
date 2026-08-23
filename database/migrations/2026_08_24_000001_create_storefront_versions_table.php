<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('storefront_versions')) {
            Schema::create('storefront_versions', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique(); // v1, v2, v3
                $table->string('name'); // TechLand Classic, Modern Tech Superstore, TechMarket BD Gadget Hub
                $table->string('slug')->unique();
                $table->string('status')->default('published'); // published, draft, scheduled
                $table->boolean('is_active')->default(false);
                $table->text('description')->nullable();
                $table->json('theme_config')->nullable(); // primary, secondary, text, surface, border, radius, shadow, font
                $table->json('version_config')->nullable(); // features, header_style, footer_style, default_layout
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_versions');
    }
};
