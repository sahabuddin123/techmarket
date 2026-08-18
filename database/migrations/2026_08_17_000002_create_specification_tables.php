<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specification_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Processor, Display, Memory, Storage
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('specification_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specification_group_id')->constrained('specification_groups')->onDelete('cascade');
            $table->string('name'); // e.g., Processor Model, RAM Capacity
            $table->string('unit')->nullable(); // e.g., GHz, GB, Hz
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('category_specification_attributes', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('specification_attribute_id')->constrained('specification_attributes')->onDelete('cascade');
            $table->boolean('is_filterable')->default(false);
            $table->primary(['category_id', 'specification_attribute_id'], 'cat_spec_primary');
        });

        Schema::create('product_specification_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('specification_attribute_id')->constrained('specification_attributes')->onDelete('cascade');
            $table->text('value'); // e.g., Core i9 14900HX, 16GB
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_specification_values');
        Schema::dropIfExists('category_specification_attributes');
        Schema::dropIfExists('specification_attributes');
        Schema::dropIfExists('specification_groups');
    }
};
