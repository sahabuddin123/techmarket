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
        // 1. Units of Measurement table
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Piece, Box, Meter, Kilogram, Pack, Set
            $table->string('short_code')->unique(); // e.g. pcs, box, m, kg, pack, set, l, roll
            $table->string('symbol')->nullable(); // e.g. pc, bx, m, kg
            $table->string('type')->default('quantity'); // quantity, weight, length, volume, other
            $table->foreignId('base_unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->decimal('conversion_factor', 12, 4)->default(1.0000); // 1 Box = 12 Pieces
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Add unit_id to products table if not exists
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'unit_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('unit_id')->nullable()->after('brand_id')->constrained('units')->onDelete('set null');
            });
        }

        // 3. Bulk Imports table
        Schema::create('bulk_imports', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // products, units, categories, brands
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_format', 10)->default('csv'); // csv, xlsx
            $table->string('mode')->default('create_or_update'); // create_only, update_only, create_or_update
            $table->string('status')->default('pending'); // pending, validating, queued, processing, completed, completed_with_errors, failed, cancelled
            $table->integer('total_rows')->default(0);
            $table->integer('processed_rows')->default(0);
            $table->integer('created_rows')->default(0);
            $table->integer('updated_rows')->default(0);
            $table->integer('skipped_rows')->default(0);
            $table->integer('failed_rows')->default(0);
            $table->json('column_mapping')->nullable();
            $table->json('validation_results')->nullable();
            $table->json('error_summary')->nullable();
            $table->string('error_file_path')->nullable();
            $table->boolean('is_dry_run')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 4. Bulk Exports table
        Schema::create('bulk_exports', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // products, units, categories, brands
            $table->string('file_path')->nullable();
            $table->string('file_name');
            $table->string('file_format', 10)->default('csv'); // csv, xlsx, json
            $table->json('filter_criteria')->nullable();
            $table->json('selected_columns')->nullable();
            $table->integer('total_rows')->default(0);
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulk_exports');
        Schema::dropIfExists('bulk_imports');

        if (Schema::hasTable('products') && Schema::hasColumn('products', 'unit_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['unit_id']);
                $table->dropColumn('unit_id');
            });
        }

        Schema::dropIfExists('units');
    }
};
