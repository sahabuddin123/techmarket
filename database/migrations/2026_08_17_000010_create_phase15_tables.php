<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Refunds Ledger Table
        if (!Schema::hasTable('refunds')) {
            Schema::create('refunds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
                $table->decimal('amount', 12, 2);
                $table->enum('status', ['requested', 'approved', 'processing', 'completed', 'rejected'])->default('requested');
                $table->text('reason')->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->string('gateway_reference')->nullable();
                $table->timestamps();
            });
        }

        // 2. Recently Viewed Products Table
        if (!Schema::hasTable('recently_viewed_products')) {
            Schema::create('recently_viewed_products', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('session_id')->nullable()->index();
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['user_id', 'product_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recently_viewed_products');
        Schema::dropIfExists('refunds');
    }
};
