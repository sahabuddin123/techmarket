<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Saved Reports Table
        Schema::create('cctv_saved_reports', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('report_type', 50)->default('sales'); // sales, estimates, quotes, orders, products, projects, installations, services, warranties
            $table->text('description')->nullable();
            $table->json('columns'); // selected columns to display
            $table->json('filters')->nullable(); // date range, status, project type, etc.
            $table->string('group_by', 50)->nullable();
            $table->string('sort_by', 50)->default('created_at');
            $table->string('sort_direction', 10)->default('desc');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cctv_saved_reports');
    }
};
