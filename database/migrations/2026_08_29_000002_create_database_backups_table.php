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
        Schema::create('database_backups', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->enum('format', ['sqlite', 'sql']);
            $table->enum('compression', ['none', 'gzip'])->default('none');
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->enum('type', ['manual', 'scheduled'])->default('manual');
            $table->enum('status', ['completed', 'failed'])->default('completed');
            $table->text('error_message')->nullable();
            $table->unsignedInteger('tables_count')->default(0);
            $table->unsignedBigInteger('records_count')->default(0);
            $table->decimal('duration_seconds', 8, 2)->default(0.00);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['format', 'status']);
            $table->index(['type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('database_backups');
    }
};
