<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add transaction & courier columns to orders table
        if (!Schema::hasColumn('orders', 'transaction_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('transaction_id')->nullable()->after('payment_status');
                $table->string('sender_number')->nullable()->after('transaction_id');
                $table->json('payment_data')->nullable()->after('sender_number');
                $table->string('courier_provider')->nullable()->default('Pathao')->after('status');
                $table->string('courier_status')->nullable()->default('not_created')->after('courier_provider');
                $table->string('courier_tracking_code')->nullable()->after('courier_status');
            });
        }

        // Create Payment Ledger Table with full state machine statuses
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('payment_method'); // COD, bKash, Nagad, SSLCommerz
                $table->string('transaction_id')->nullable()->unique();
                $table->decimal('amount', 12, 2);
                $table->string('currency')->default('BDT');
                $table->enum('status', ['pending', 'initiated', 'awaiting_verification', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'])->default('pending');
                $table->text('notes')->nullable();
                $table->json('gateway_response')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        if (Schema::hasColumn('orders', 'transaction_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn([
                    'transaction_id',
                    'sender_number',
                    'payment_data',
                    'courier_provider',
                    'courier_status',
                    'courier_tracking_code'
                ]);
            });
        }
    }
};
