<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add recovery token & timestamp to abandoned_carts table
        if (!Schema::hasColumn('abandoned_carts', 'recovery_token')) {
            Schema::table('abandoned_carts', function (Blueprint $table) {
                $table->string('recovery_token')->nullable()->unique()->after('status');
                $table->timestamp('recovery_sent_at')->nullable()->after('recovery_token');
            });
        }

        // 2. Add last_notified_price to product_alerts table
        if (!Schema::hasColumn('product_alerts', 'last_notified_price')) {
            Schema::table('product_alerts', function (Blueprint $table) {
                $table->decimal('last_notified_price', 12, 2)->nullable()->after('reference_price');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('product_alerts', 'last_notified_price')) {
            Schema::table('product_alerts', function (Blueprint $table) {
                $table->dropColumn('last_notified_price');
            });
        }

        if (Schema::hasColumn('abandoned_carts', 'recovery_token')) {
            Schema::table('abandoned_carts', function (Blueprint $table) {
                $table->dropColumn(['recovery_token', 'recovery_sent_at']);
            });
        }
    }
};
