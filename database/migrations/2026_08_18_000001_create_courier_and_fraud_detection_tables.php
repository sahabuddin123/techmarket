<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Shipments Table
        if (!Schema::hasTable('shipments')) {
            Schema::create('shipments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->string('courier_provider')->index(); // 'steadfast', 'pathao', 'redx'
                $table->string('consignment_id')->nullable()->index();
                $table->string('tracking_code')->nullable()->index();
                $table->string('invoice_id')->nullable()->index();
                $table->string('recipient_name');
                $table->string('recipient_phone')->index();
                $table->text('recipient_address');
                $table->string('recipient_city')->nullable();
                $table->string('recipient_zone')->nullable();
                $table->string('recipient_area')->nullable();
                $table->decimal('parcel_weight', 8, 2)->default(0.5);
                $table->decimal('cod_amount', 12, 2)->default(0);
                $table->decimal('delivery_charge', 12, 2)->default(0);
                $table->string('courier_status')->default('pending')->index(); // raw or normalized provider status
                $table->string('internal_status')->default('booked')->index(); // 'draft', 'booked', 'in_transit', 'delivered', 'partial_delivery', 'returned', 'cancelled'
                $table->string('store_id')->nullable();
                $table->string('item_type')->nullable();
                $table->text('special_instructions')->nullable();
                $table->json('request_payload')->nullable();
                $table->json('response_payload')->nullable();
                $table->timestamp('booked_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamp('cancelled_at')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        // 2. Shipment Status Histories Table
        if (!Schema::hasTable('shipment_status_histories')) {
            Schema::create('shipment_status_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');
                $table->string('courier_status');
                $table->string('internal_status');
                $table->text('notes')->nullable();
                $table->json('raw_response')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        // 3. Fraud Checks Table
        if (!Schema::hasTable('fraud_checks')) {
            Schema::create('fraud_checks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('cascade');
                $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('customer_phone')->index();
                $table->string('customer_email')->nullable()->index();
                $table->string('customer_name')->nullable();
                $table->text('shipping_address')->nullable();
                $table->unsignedTinyInteger('risk_score')->default(0)->index(); // 0 to 100
                $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->default('low')->index();
                $table->json('reasons')->nullable(); // Array of warning reason strings
                $table->json('positive_signals')->nullable(); // Array of positive trust signals
                $table->json('breakdown')->nullable(); // Detailed score computation breakdown
                $table->enum('status', ['passed', 'warning', 'review_required', 'on_hold', 'approved', 'rejected'])->default('passed')->index();
                $table->boolean('is_duplicate')->default(false)->index();
                $table->json('related_order_ids')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('reviewed_at')->nullable();
                $table->string('review_action')->nullable(); // 'approved', 'rejected', 'override', 'hold'
                $table->text('review_notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Fraud Signals Table
        if (!Schema::hasTable('fraud_signals')) {
            Schema::create('fraud_signals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('fraud_check_id')->constrained('fraud_checks')->onDelete('cascade');
                $table->string('signal_type')->index(); // 'high_return_rate', 'rapid_orders', 'suspicious_phone', etc.
                $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('low');
                $table->integer('score_impact')->default(0);
                $table->text('description');
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }

        // 5. Fraud Review Logs Table
        if (!Schema::hasTable('fraud_review_logs')) {
            Schema::create('fraud_review_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('fraud_check_id')->constrained('fraud_checks')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('action'); // 'approved', 'rejected', 'override_score', 'hold', 'note_added'
                $table->string('old_status')->nullable();
                $table->string('new_status')->nullable();
                $table->unsignedTinyInteger('old_score')->nullable();
                $table->unsignedTinyInteger('new_score')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 6. Extend Orders Table with Fraud Fields if not present
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'fraud_score')) {
                $table->unsignedTinyInteger('fraud_score')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'fraud_risk_level')) {
                $table->string('fraud_risk_level')->nullable()->after('fraud_score');
            }
            if (!Schema::hasColumn('orders', 'fraud_status')) {
                $table->string('fraud_status')->default('clean')->after('fraud_risk_level'); // 'clean', 'review_required', 'on_hold', 'approved', 'rejected'
            }
            if (!Schema::hasColumn('orders', 'fraud_check_id')) {
                $table->foreignId('fraud_check_id')->nullable()->after('fraud_status')->constrained('fraud_checks')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'fraud_check_id')) {
                $table->dropForeign(['fraud_check_id']);
                $table->dropColumn('fraud_check_id');
            }
            if (Schema::hasColumn('orders', 'fraud_status')) {
                $table->dropColumn('fraud_status');
            }
            if (Schema::hasColumn('orders', 'fraud_risk_level')) {
                $table->dropColumn('fraud_risk_level');
            }
            if (Schema::hasColumn('orders', 'fraud_score')) {
                $table->dropColumn('fraud_score');
            }
        });

        Schema::dropIfExists('fraud_review_logs');
        Schema::dropIfExists('fraud_signals');
        Schema::dropIfExists('fraud_checks');
        Schema::dropIfExists('shipment_status_histories');
        Schema::dropIfExists('shipments');
    }
};
