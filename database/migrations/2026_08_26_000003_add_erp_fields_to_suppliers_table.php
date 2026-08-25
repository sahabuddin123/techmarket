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
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'supplier_code')) {
                $table->string('supplier_code')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('suppliers', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (!Schema::hasColumn('suppliers', 'postal_code')) {
                $table->string('postal_code')->nullable()->after('city');
            }
            if (!Schema::hasColumn('suppliers', 'country')) {
                $table->string('country')->default('Bangladesh')->nullable()->after('postal_code');
            }
            if (!Schema::hasColumn('suppliers', 'website')) {
                $table->string('website')->nullable()->after('tax_number');
            }
            if (!Schema::hasColumn('suppliers', 'credit_limit')) {
                $table->decimal('credit_limit', 14, 2)->default(0.00)->after('current_balance');
            }
            if (!Schema::hasColumn('suppliers', 'opening_balance_type')) {
                $table->enum('opening_balance_type', ['payable', 'advance', 'neutral'])->default('payable')->after('opening_balance');
            }
            if (!Schema::hasColumn('suppliers', 'payment_terms')) {
                $table->string('payment_terms')->default('due_on_receipt')->after('credit_limit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn([
                'supplier_code',
                'city',
                'postal_code',
                'country',
                'website',
                'credit_limit',
                'opening_balance_type',
                'payment_terms',
            ]);
        });
    }
};
