<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend Categories table with navigation and display attributes
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'is_featured')) {
                $table->boolean('is_featured')->default(true)->after('icon');
            }
            if (!Schema::hasColumn('categories', 'is_nav_visible')) {
                $table->boolean('is_nav_visible')->default(true)->after('is_featured');
            }
            if (!Schema::hasColumn('categories', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_nav_visible');
            }
            if (!Schema::hasColumn('categories', 'image')) {
                $table->string('image')->nullable()->after('sort_order');
            }
        });

        // 2. Extend Banners table with placement, mobile image, and scheduling
        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'placement')) {
                $table->string('placement')->default('hero_slider')->after('image'); // hero_slider, side_banner_top, side_banner_bottom, promo_banner
            }
            if (!Schema::hasColumn('banners', 'mobile_image')) {
                $table->string('mobile_image')->nullable()->after('placement');
            }
            if (!Schema::hasColumn('banners', 'start_time')) {
                $table->timestamp('start_time')->nullable()->after('sort_order');
            }
            if (!Schema::hasColumn('banners', 'end_time')) {
                $table->timestamp('end_time')->nullable()->after('start_time');
            }
        });

        // 3. Create Quick Action Cards table
        if (!Schema::hasTable('quick_actions')) {
            Schema::create('quick_actions', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->string('icon')->default('Wrench'); // Lucide icon name or image path
                $table->string('url')->default('/pc-builder');
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('quick_actions');

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['placement', 'mobile_image', 'start_time', 'end_time']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['is_featured', 'is_nav_visible', 'sort_order', 'image']);
        });
    }
};
