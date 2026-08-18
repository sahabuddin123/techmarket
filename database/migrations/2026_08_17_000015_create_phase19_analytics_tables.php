<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add cost_price to products table if missing
        if (!Schema::hasColumn('products', 'cost_price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('cost_price', 12, 2)->nullable()->after('regular_price');
            });
        }

        // 2. Add performance composite indexes for analytics
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'orders_status_created_idx');
            $table->index(['user_id', 'created_at'], 'orders_user_created_idx');
            $table->index(['courier_provider', 'courier_status'], 'orders_courier_status_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['product_id', 'created_at'], 'order_items_product_created_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'payments_status_created_idx');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'refunds_status_created_idx');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->index(['type', 'created_at'], 'inventory_movements_type_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropIndex('inventory_movements_type_created_idx');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->dropIndex('refunds_status_created_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_status_created_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_product_created_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_created_idx');
            $table->dropIndex('orders_user_created_idx');
            $table->dropIndex('orders_courier_status_idx');
        });

        if (Schema::hasColumn('products', 'cost_price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('cost_price');
            });
        }
    }
};
