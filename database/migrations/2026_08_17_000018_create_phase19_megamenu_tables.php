<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'mega_menu_enabled')) {
                $table->boolean('mega_menu_enabled')->default(true)->after('is_nav_visible');
            }
            if (!Schema::hasColumn('categories', 'mega_menu_type')) {
                $table->string('mega_menu_type')->default('auto')->after('mega_menu_enabled'); // auto, manual, simple_dropdown, direct_link
            }
            if (!Schema::hasColumn('categories', 'mega_menu_layout')) {
                $table->string('mega_menu_layout')->default('auto')->after('mega_menu_type'); // 2_columns, 3_columns, 4_columns, auto
            }
            if (!Schema::hasColumn('categories', 'mega_menu_config')) {
                $table->json('mega_menu_config')->nullable()->after('mega_menu_layout'); // promo banner, manual groups, max items
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['mega_menu_enabled', 'mega_menu_type', 'mega_menu_layout', 'mega_menu_config']);
        });
    }
};
