<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. SMS Gateways Table
        Schema::create('sms_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. BulkSMS BD, MIM SMS, Greenweb SMS, Generic HTTP
            $table->string('slug')->unique(); // e.g. bulksmsbd, mimsms, greenweb, generic_http
            $table->string('driver'); // bulksmsbd, mimsms, greenweb, generic_http
            $table->boolean('is_active')->default(false);
            $table->boolean('is_default')->default(false);
            $table->text('credentials')->nullable(); // Encrypted JSON payload of API keys/secrets
            $table->json('settings')->nullable(); // Base URL, Sender ID, custom headers, field mappings
            $table->string('status_notes')->nullable();
            $table->timestamp('last_tested_at')->nullable();
            $table->timestamps();
        });

        // 2. SMS Templates Table
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('event_key')->unique(); // e.g. order.placed, order.confirmed, admin.new_order
            $table->enum('category', ['transactional', 'promotional', 'admin_alert', 'auth'])->default('transactional');
            $table->enum('recipient_type', ['customer', 'admin', 'custom'])->default('customer');
            $table->text('message');
            $table->json('variables')->nullable(); // List of available variable tags
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. SMS Logs Table
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('phone')->index();
            $table->text('message');
            $table->string('event_key')->nullable()->index();
            $table->string('gateway_slug')->nullable()->index();
            $table->string('provider_message_id')->nullable()->index();
            $table->enum('status', ['queued', 'processing', 'sent', 'delivered', 'failed', 'rejected'])->default('queued')->index();
            $table->integer('parts')->default(1);
            $table->string('encoding')->default('gsm0338'); // gsm0338 or unicode
            $table->integer('character_count')->default(0);
            $table->string('idempotency_key')->nullable()->index();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        // 4. Add SMS Preferences to Users table if not already present
        if (!Schema::hasColumn('users', 'sms_transactional_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('sms_transactional_enabled')->default(true)->after('remember_token');
                $table->boolean('sms_promotional_enabled')->default(true)->after('sms_transactional_enabled');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('sms_templates');
        Schema::dropIfExists('sms_gateways');

        if (Schema::hasColumn('users', 'sms_transactional_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['sms_transactional_enabled', 'sms_promotional_enabled']);
            });
        }
    }
};
