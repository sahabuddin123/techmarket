<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Payment Histories & Refund Audit Trail
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        // 2. Abandoned Carts Table
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('session_id')->index();
            $table->json('items');
            $table->decimal('total_value', 12, 2)->default(0.00);
            $table->enum('status', ['active', 'abandoned', 'recovered', 'expired'])->default('active');
            $table->timestamp('last_activity_at');
            $table->foreignId('recovered_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->timestamps();
        });

        // 3. Loyalty Transactions Ledger Table
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->enum('type', ['earned', 'redeemed', 'reversed', 'adjusted'])->default('earned');
            $table->integer('points');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Referrals Table
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade');
            $table->string('referral_code')->index();
            $table->enum('status', ['pending', 'qualified', 'rewarded', 'rejected'])->default('pending');
            $table->integer('reward_points')->default(0);
            $table->timestamps();
        });

        // 5. Product Alerts Table (Back in Stock & Price Drop)
        Schema::create('product_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->enum('type', ['back_in_stock', 'price_drop']);
            $table->decimal('reference_price', 12, 2)->nullable();
            $table->enum('status', ['active', 'triggered', 'cancelled'])->default('active');
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();
        });

        // 6. Marketing Automations Table
        Schema::create('marketing_automations', function (Blueprint $table) {
            $table->id();
            $table->string('trigger_event'); // order_completed, abandoned_cart, user_registered, price_drop
            $table->string('name');
            $table->string('channel')->default('database'); // database, email
            $table->boolean('is_active')->default(true);
            $table->text('template');
            $table->timestamps();
        });

        // Add referral_code column to users table if missing
        if (!Schema::hasColumn('users', 'referral_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('referral_code')->nullable()->unique()->after('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'referral_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('referral_code');
            });
        }

        Schema::dropIfExists('marketing_automations');
        Schema::dropIfExists('product_alerts');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('abandoned_carts');
        Schema::dropIfExists('payment_histories');
    }
};
