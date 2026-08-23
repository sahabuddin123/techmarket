<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cctv_quotes', function (Blueprint $table) {
            if (!Schema::hasColumn('cctv_quotes', 'share_token')) {
                $table->string('share_token', 64)->nullable()->unique()->after('quote_number');
            }
            if (!Schema::hasColumn('cctv_quotes', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('status');
                $table->string('approval_ip', 50)->nullable()->after('approved_at');
                $table->text('approval_user_agent')->nullable()->after('approval_ip');
                $table->integer('revision_number')->default(1)->after('approval_user_agent');
                $table->foreignId('parent_quote_id')->nullable()->constrained('cctv_quotes')->onDelete('set null')->after('revision_number');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'cctv_snapshot')) {
                $table->json('cctv_snapshot')->nullable()->after('total');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'cctv_quote_id')) {
                $table->foreignId('cctv_quote_id')->nullable()->constrained('cctv_quotes')->onDelete('set null')->after('notes');
            }
            if (!Schema::hasColumn('orders', 'cctv_configuration_snapshot')) {
                $table->json('cctv_configuration_snapshot')->nullable()->after('cctv_quote_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'cctv_configuration_snapshot')) {
                $table->dropColumn('cctv_configuration_snapshot');
            }
            if (Schema::hasColumn('orders', 'cctv_quote_id')) {
                $table->dropConstrainedForeignId('cctv_quote_id');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'cctv_snapshot')) {
                $table->dropColumn('cctv_snapshot');
            }
        });

        Schema::table('cctv_quotes', function (Blueprint $table) {
            if (Schema::hasColumn('cctv_quotes', 'parent_quote_id')) {
                $table->dropConstrainedForeignId('parent_quote_id');
            }
            if (Schema::hasColumn('cctv_quotes', 'share_token')) {
                $table->dropColumn(['share_token', 'approved_at', 'approval_ip', 'approval_user_agent', 'revision_number']);
            }
        });
    }
};
