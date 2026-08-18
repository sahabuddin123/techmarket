<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Email Gateways Table
        if (!Schema::hasTable('email_gateways')) {
            Schema::create('email_gateways', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('driver', 32)->default('smtp')->index(); // smtp, sendgrid, mailgun, ses, brevo, generic_smtp
                $table->boolean('is_active')->default(true)->index();
                $table->boolean('is_default')->default(false)->index();
                $table->boolean('is_fallback')->default(false)->index();
                $table->text('config')->nullable(); // Encrypted JSON payload
                $table->string('from_name')->default('TechMarket BD');
                $table->string('from_email')->default('noreply@techmarketbd.com');
                $table->string('reply_to_email')->nullable();
                $table->timestamp('verified_at')->nullable();
                $table->timestamp('last_tested_at')->nullable();
                $table->text('last_error')->nullable();
                $table->timestamps();
            });
        }

        // 2. Email Templates Table
        if (!Schema::hasTable('email_templates')) {
            Schema::create('email_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug', 64)->unique();
                $table->string('category', 32)->default('ORDER')->index(); // ORDER, PAYMENT, COURIER, FRAUD, INVENTORY, CUSTOMER, MARKETING, PROMOTION, SECURITY, SYSTEM, WELCOME
                $table->string('subject');
                $table->string('preheader')->nullable();
                $table->longText('html_content');
                $table->longText('plain_text_content')->nullable();
                $table->json('editor_schema')->nullable(); // JSON schema of drag & drop blocks
                $table->json('variables')->nullable(); // List of available variables
                $table->string('thumbnail')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->timestamps();
            });
        }

        // 3. Email Logs Table
        if (!Schema::hasTable('email_logs')) {
            Schema::create('email_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('gateway_id')->nullable()->constrained('email_gateways')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('recipient_email')->index();
                $table->string('recipient_name')->nullable();
                $table->string('subject');
                $table->string('event_key', 64)->nullable()->index();
                $table->foreignId('template_id')->nullable()->constrained('email_templates')->nullOnDelete();
                $table->string('related_type')->nullable();
                $table->unsignedBigInteger('related_id')->nullable();
                $table->string('status', 32)->default('queued')->index(); // queued, sending, sent, delivered, opened, clicked, bounced, failed
                $table->string('provider_message_id')->nullable()->index();
                $table->unsignedInteger('attempts')->default(0);
                $table->text('error_message')->nullable();
                $table->json('request_data')->nullable();
                $table->json('response_data')->nullable();
                $table->timestamp('queued_at')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamp('opened_at')->nullable();
                $table->timestamp('clicked_at')->nullable();
                $table->timestamp('bounced_at')->nullable();
                $table->timestamp('failed_at')->nullable();
                $table->timestamps();

                $table->index(['related_type', 'related_id']);
            });
        }

        // 4. Email Preferences Table
        if (!Schema::hasTable('email_preferences')) {
            Schema::create('email_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
                $table->string('email')->unique();
                $table->boolean('transactional_enabled')->default(true);
                $table->boolean('promotional_enabled')->default(true);
                $table->boolean('marketing_enabled')->default(true);
                $table->boolean('product_updates_enabled')->default(true);
                $table->boolean('order_updates_enabled')->default(true);
                $table->boolean('security_alerts_enabled')->default(true);
                $table->timestamp('unsubscribed_at')->nullable();
                $table->timestamps();
            });
        }

        // 5. Email Campaigns Table
        if (!Schema::hasTable('email_campaigns')) {
            Schema::create('email_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('subject');
                $table->string('preheader')->nullable();
                $table->foreignId('template_id')->nullable()->constrained('email_templates')->nullOnDelete();
                $table->string('audience_type', 32)->default('all_customers'); // all_customers, active_buyers, product_buyers, inactive_customers, custom_filtered
                $table->json('audience_filters')->nullable();
                $table->string('status', 32)->default('draft')->index(); // draft, scheduled, sending, paused, completed, failed
                $table->timestamp('scheduled_at')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->unsignedInteger('total_recipients')->default(0);
                $table->unsignedInteger('total_sent')->default(0);
                $table->unsignedInteger('total_delivered')->default(0);
                $table->unsignedInteger('total_failed')->default(0);
                $table->unsignedInteger('total_opened')->default(0);
                $table->unsignedInteger('total_clicked')->default(0);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        // 6. Email Campaign Recipients Table
        if (!Schema::hasTable('email_campaign_recipients')) {
            Schema::create('email_campaign_recipients', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campaign_id')->constrained('email_campaigns')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('email')->index();
                $table->string('status', 32)->default('pending')->index(); // pending, sent, delivered, opened, clicked, failed, skipped
                $table->string('provider_message_id')->nullable()->index();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamp('opened_at')->nullable();
                $table->timestamp('clicked_at')->nullable();
                $table->timestamp('failed_at')->nullable();
                $table->timestamps();
            });
        }

        // 7. Email Unsubscribes Table
        if (!Schema::hasTable('email_unsubscribes')) {
            Schema::create('email_unsubscribes', function (Blueprint $table) {
                $table->id();
                $table->string('email')->index();
                $table->string('category')->nullable();
                $table->text('reason')->nullable();
                $table->string('token', 64)->unique();
                $table->timestamp('unsubscribed_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('email_unsubscribes');
        Schema::dropIfExists('email_campaign_recipients');
        Schema::dropIfExists('email_campaigns');
        Schema::dropIfExists('email_preferences');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('email_gateways');
    }
};
