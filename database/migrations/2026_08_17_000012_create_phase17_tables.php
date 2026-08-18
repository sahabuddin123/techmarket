<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add historical immutable snapshots to order_items
        if (!Schema::hasColumn('order_items', 'sku_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('sku_snapshot')->nullable()->after('product_name');
                $table->string('image_snapshot')->nullable()->after('sku_snapshot');
                $table->json('specs_snapshot')->nullable()->after('image_snapshot');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('order_items', 'sku_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn(['sku_snapshot', 'image_snapshot', 'specs_snapshot']);
            });
        }
    }
};
