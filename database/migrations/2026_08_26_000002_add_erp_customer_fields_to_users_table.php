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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'customer_code')) {
                $table->string('customer_code')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('users', 'credit_limit')) {
                $table->decimal('credit_limit', 14, 2)->default(0.00)->after('address');
            }
            if (!Schema::hasColumn('users', 'opening_balance')) {
                $table->decimal('opening_balance', 14, 2)->default(0.00)->after('credit_limit');
            }
            if (!Schema::hasColumn('users', 'opening_balance_type')) {
                $table->enum('opening_balance_type', ['receivable', 'payable', 'neutral'])->default('receivable')->after('opening_balance');
            }
            if (!Schema::hasColumn('users', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'state')) {
                $table->string('state')->nullable()->after('city');
            }
            if (!Schema::hasColumn('users', 'postal_code')) {
                $table->string('postal_code')->nullable()->after('state');
            }
            if (!Schema::hasColumn('users', 'country')) {
                $table->string('country')->default('Bangladesh')->after('postal_code');
            }
            if (!Schema::hasColumn('users', 'tax_number')) {
                $table->string('tax_number')->nullable()->after('country');
            }
            if (!Schema::hasColumn('users', 'notes')) {
                $table->text('notes')->nullable()->after('tax_number');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('notes');
            }
            if (!Schema::hasColumn('users', 'is_walk_in')) {
                $table->boolean('is_walk_in')->default(false)->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'customer_code',
                'credit_limit',
                'opening_balance',
                'opening_balance_type',
                'city',
                'state',
                'postal_code',
                'country',
                'tax_number',
                'notes',
                'status',
                'is_walk_in',
            ]);
        });
    }
};
