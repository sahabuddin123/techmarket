<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend or Create notifications Table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        // Safely add extended enterprise alert columns to notifications table
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->foreignId('user_id')->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'recipient_type')) {
                $table->string('recipient_type')->default('user')->index();
            }
            if (!Schema::hasColumn('notifications', 'recipient_id')) {
                $table->unsignedBigInteger('recipient_id')->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'category')) {
                $table->string('category', 32)->default('SYSTEM')->index();
            }
            if (!Schema::hasColumn('notifications', 'priority')) {
                $table->string('priority', 16)->default('NORMAL')->index();
            }
            if (!Schema::hasColumn('notifications', 'title')) {
                $table->string('title')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'message')) {
                $table->text('message')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'icon')) {
                $table->string('icon', 64)->nullable();
            }
            if (!Schema::hasColumn('notifications', 'image')) {
                $table->string('image')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'action_url')) {
                $table->string('action_url')->nullable();
            }
            if (!Schema::hasColumn('notifications', 'action_label')) {
                $table->string('action_label', 64)->nullable();
            }
            if (!Schema::hasColumn('notifications', 'seen_at')) {
                $table->timestamp('seen_at')->nullable()->index();
            }
            if (!Schema::hasColumn('notifications', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->index();
            }
        });

        // 2. Notification Preferences Table
        if (!Schema::hasTable('notification_preferences')) {
            Schema::create('notification_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('notification_type', 64)->index(); // Category or specific event
                $table->boolean('in_app_enabled')->default(true);
                $table->boolean('browser_enabled')->default(true);
                $table->boolean('sms_enabled')->default(false);
                $table->boolean('email_enabled')->default(false);
                $table->timestamps();

                $table->unique(['user_id', 'notification_type'], 'user_notif_pref_unique');
            });
        }

        // 3. Notification Rules Table
        if (!Schema::hasTable('notification_rules')) {
            Schema::create('notification_rules', function (Blueprint $table) {
                $table->id();
                $table->string('event_key', 64)->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('category', 32)->default('SYSTEM')->index();
                $table->string('default_priority', 16)->default('NORMAL')->index();
                $table->boolean('enabled')->default(true)->index();
                $table->json('notify_roles')->nullable(); // Array of role names e.g. ['admin', 'super_admin']
                $table->json('notify_users')->nullable(); // Array of user IDs
                $table->json('channels'); // Array of channels e.g. ['in_app', 'browser', 'sms']
                $table->string('template_title');
                $table->text('template_message');
                $table->string('action_url_template')->nullable();
                $table->timestamps();
            });
        }

        // 4. Notification Logs Table
        if (!Schema::hasTable('notification_logs')) {
            Schema::create('notification_logs', function (Blueprint $table) {
                $table->id();
                $table->string('notification_id', 64)->nullable()->index();
                $table->string('event_key', 64)->index();
                $table->string('channel', 32)->index();
                $table->string('recipient_type', 32)->default('user');
                $table->unsignedBigInteger('recipient_id')->nullable()->index();
                $table->string('status', 32)->default('sent')->index(); // sent, failed, skipped, deduplicated
                $table->json('provider_response')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_rules');
        Schema::dropIfExists('notification_preferences');
    }
};
