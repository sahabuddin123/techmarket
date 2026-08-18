<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Chat Sessions Table
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_token', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('status', 30)->default('active'); // active, escalated, closed
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });

        // 2. Chat Messages Table
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')->constrained('chat_sessions')->cascadeOnDelete();
            $table->string('sender', 30)->default('user'); // user, bot, agent
            $table->text('message');
            $table->string('type', 40)->default('text'); // text, products, order_status, escalation_prompt, policy
            $table->json('payload')->nullable(); // JSON data for product list, order timeline, suggestion chips
            $table->timestamps();
        });

        // 3. Support Tickets (Escalated Queries) Table
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 50)->unique();
            $table->foreignId('chat_session_id')->nullable()->constrained('chat_sessions')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('subject')->nullable();
            $table->text('inquiry_text');
            $table->string('status', 30)->default('new'); // new, in_progress, resolved, closed
            $table->string('priority', 30)->default('medium'); // low, medium, high
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
