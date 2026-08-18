<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('saved_pc_builds')) {
            Schema::create('saved_pc_builds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('session_id')->nullable()->index();
                $table->string('name')->default('Custom Gaming Rig');
                $table->json('components'); // Array of slot => product_id
                $table->decimal('total_price', 12, 2)->default(0.00);
                $table->integer('estimated_wattage')->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_pc_builds');
    }
};
